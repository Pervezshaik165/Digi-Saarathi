#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import util from 'util';
import connectDB from '../config/db.js';
import Scheme from '../models/schemeModel.js';
import { fileURLToPath } from 'url';
import commonMapper from './mappers/commonMapper.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCES_PATH = path.join(__dirname, '..', 'data', 'sources.json');
const REQUEST_TIMEOUT = Number(process.env.SOURCE_REQUEST_TIMEOUT_MS) || 120000; // ms

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const extractAnchors = (html, base) => {
  const re = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const results = [];
  let m;
  while ((m = re.exec(html))) {
    try {
      const href = m[1].trim();
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      if (!href || !text) continue;
      let url;
      try { url = new URL(href, base).href; } catch { continue; }
      results.push({ href: url, text });
    } catch (e) {
      continue;
    }
  }
  return results;
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, attempts = 4, baseDelay = 500, timeout = 120000) => {
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
  for (let i = 1; i <= attempts; i++) {
    try {
      const resp = await axios.get(url, { timeout, headers });
      return resp;
    } catch (err) {
      const waitMs = baseDelay * Math.pow(1.5, i - 1);
      console.warn(`Fetch failed (${i}/${attempts}) for ${url}: ${err.message}. Retrying in ${waitMs}ms`);
      if (i === attempts) throw err;
      await wait(waitMs);
    }
  }
};

const likelyScheme = (anchor) => {
  const s = (anchor.text + ' ' + anchor.href).toLowerCase();
  const keywords = ['scheme', 'yojana', 'pension', 'scholar', 'loan', 'benefit', 'financial', 'grant', 'subsidy'];
  return keywords.some(k => s.includes(k));
};

const parseJSONorCSV = (text) => {
  // Try JSON
  try { return JSON.parse(text); } catch (e) {}
  // Basic CSV parse: first line headers, naive split respecting quoted commas
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0];
  const headers = header.match(/(?:\\".*?\\"|[^,])+/g)?.map(h => h.replace(/^"|"$/g, '').trim()) || header.split(',').map(h=>h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]+)|,)/g);
    if (!cells) continue;
    const cleaned = [];
    // naive fallback
    const parts = line.split(',');
    for (let j = 0; j < headers.length; j++) cleaned.push(parts[j] ? parts[j].replace(/^"|"$/g,'').trim() : '');
    const obj = {};
    headers.forEach((h, idx) => obj[h] = cleaned[idx]);
    rows.push(obj);
  }
  return rows;
};

const runSource = async (src) => {
  console.log('\nProcessing source:', src.id, src.name);
  try {
    if (src.type === 'local-file') {
      const p = path.join(__dirname, '..', src.path.replace(/^\.\//, ''));
      const raw = fs.readFileSync(p, 'utf8');
      const arr = JSON.parse(raw);
      for (const r of arr) {
        const key = { source: r.source || src.id, source_id: r.source_id || (r.name || r.title) };
        const mapped = commonMapper.mapCommon(r, { scope: r.scope, state: r.state });
        const doc = { ...mapped, provenance: r.provenance || { fetch_source: 'local-curated' }, verified: r.verified || false, requires_manual_review: r.requires_manual_review || false };
        await Scheme.findOneAndUpdate(key, { $set: doc }, { upsert: true, new: true });
        console.log('Upserted:', doc.name);
      }
      return { success: true, count: arr.length };
    }

    if (src.type === 'scrape') {
      const resp = await fetchWithRetry(src.url, 4);
      const anchors = extractAnchors(resp.data, src.url);
      const candidates = anchors.filter(likelyScheme).slice(0, 500);
      let count = 0;
      for (const c of candidates) {
        const source_id = Buffer.from(c.href).toString('base64').slice(0,32);
        const key = { source: src.id, source_id };
        const mapped = { name: c.text, short_description: c.text, info_url: c.href, apply_url: c.href, scope: src.scope || 'central' };
        const doc = { ...mapped, provenance: { fetched_at: new Date(), fetch_source: src.url, raw_snippet: c.text }, requires_manual_review: true, verified: false };
        await Scheme.findOneAndUpdate(key, { $set: doc }, { upsert: true, new: true });
        count += 1;
        console.log('Upserted scraped:', c.text);
      }
      return { success: true, count };
    }

    if (src.type === 'url') {
      const resp = await fetchWithRetry(src.url, process.env.RETRY_ATTEMPTS ? Number(process.env.RETRY_ATTEMPTS) : 4, process.env.RETRY_BASE_DELAY ? Number(process.env.RETRY_BASE_DELAY) : 500, process.env.NETWORK_TIMEOUT ? Number(process.env.NETWORK_TIMEOUT) : 120000);
      const rows = parseJSONorCSV(resp.data);
      let k = 0;
      for (const r of rows) {
        const key = { source: src.id, source_id: r.id || r.resource_id || r.name || (r.title && r.title.slice(0,50)) };
        const mapped = commonMapper.mapCommon(r, src);
        const doc = { ...mapped, provenance: { fetched_at: new Date(), fetch_source: src.url } };
        await Scheme.findOneAndUpdate(key, { $set: doc }, { upsert: true, new: true });
        k += 1;
      }
      return { success: true, count: k };
    }

    return { success: false, message: 'unsupported source type' };
  } catch (err) {
    console.error('Error processing source', src.id, err.message || err);
    return { success: false, error: err.message || err };
  }
};

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — ingesting all sources from', SOURCES_PATH);
    const raw = fs.readFileSync(SOURCES_PATH, 'utf8');
    const sources = JSON.parse(raw);
    const summary = [];
    for (const src of sources) {
      const res = await runSource(src);
      summary.push({ id: src.id, name: src.name, result: res });
    }
    console.log('\nIngest summary:');
    console.table(summary.map(s => ({ id: s.id, name: s.name, ok: s.result.success, count: s.result.count || 0, error: s.result.error || s.result.message || '' }))); // eslint-disable-line
    process.exit(0);
  } catch (err) {
    console.error('Fatal error ingesting sources:', err.message || err);
    process.exit(1);
  }
};

run();
