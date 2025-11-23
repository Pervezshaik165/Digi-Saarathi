#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import Scheme from '../models/schemeModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'curated_schemes.json');

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — ingesting curated schemes...');

    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const arr = JSON.parse(raw);
    let inserted = 0;
    let updated = 0;

    for (const s of arr) {
      const key = { source: s.source || 'curated-seed', source_id: s.source_id || s.name };
      const now = new Date();
      const doc = { ...s, updated_at: now };
      const res = await Scheme.findOneAndUpdate(key, { $set: doc }, { upsert: true, new: true });
      if (res) {
        // crude way to treat as inserted vs updated
        // if createdAt exists and equals updatedAt, treat as inserted
      }
      inserted += 1;
      console.log('Upserted:', s.name);
    }

    console.log(`Ingest complete — processed ${inserted} records.`);
    process.exit(0);
  } catch (err) {
    console.error('Error ingesting curated:', err.message || err);
    process.exit(1);
  }
};

run();
