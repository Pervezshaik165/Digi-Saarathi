#!/usr/bin/env node
import dotenv from 'dotenv';
import axios from 'axios';
import connectDB from '../config/db.js';
import Scheme from '../models/schemeModel.js';
import crypto from 'crypto';

dotenv.config();

const TARGET = 'https://www.india.gov.in/what-you-need-government-schemes';
const REQUEST_TIMEOUT = Number(process.env.SOURCE_REQUEST_TIMEOUT_MS) || 120000;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await axios.get(url, { timeout: REQUEST_TIMEOUT });
    } catch (err) {
      lastErr = err;
      const backoff = 500 * (i + 1);
      console.warn(`Fetch failed (${i + 1}/${attempts}) for ${url}: ${err.message}. Retrying in ${backoff}ms`);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

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

const likelyScheme = (anchor) => {
  const s = (anchor.text + ' ' + anchor.href).toLowerCase();
  const keywords = ['scheme', 'yojana', 'pension', 'scholar', 'loan', 'benefit', 'financial', 'grant', 'subsidy'];
  return keywords.some(k => s.includes(k));
};

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — fetching national portal...');
    const resp = await fetchWithRetry(TARGET, process.env.RETRY_ATTEMPTS ? Number(process.env.RETRY_ATTEMPTS) : 4, process.env.RETRY_BASE_DELAY ? Number(process.env.RETRY_BASE_DELAY) : 500, process.env.NETWORK_TIMEOUT ? Number(process.env.NETWORK_TIMEOUT) : 120000);
    const html = resp.data;
    const anchors = extractAnchors(html, TARGET);

    const candidates = anchors.filter(likelyScheme).slice(0, 500);
    console.log('Found', candidates.length, 'candidate scheme links');

    let inserted = 0;
    for (const c of candidates) {
      const source_id = crypto.createHash('sha1').update(c.href).digest('hex');
      const key = { source: 'national-portal', source_id };
      const doc = {
        name: c.text,
        short_description: c.text,
        info_url: c.href,
        apply_url: c.href,
        source: 'national-portal',
        source_id,
        provenance: { fetched_at: new Date(), fetch_source: TARGET, raw_snippet: c.text },
        requires_manual_review: true,
        verified: false,
      };
      const up = await Scheme.findOneAndUpdate(key, { $set: doc }, { upsert: true, new: true });
      inserted += 1;
      console.log('Upserted:', c.text, '->', c.href);
    }

    console.log('Done — upserted', inserted, 'records.');
    process.exit(0);
  } catch (err) {
    console.error('Error during discovery/ingest:', err.message || err);
    process.exit(1);
  }
};

run();
