#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Scheme from '../models/schemeModel.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — fixing missing info_url...');
    const docs = await Scheme.find({ $or: [ { info_url: { $exists: false } }, { info_url: null }, { info_url: '' } ] });
    console.log('Found', docs.length, 'records with missing info_url');
    let updated = 0;
    for (const d of docs) {
      let newInfo = d.apply_url || (d.provenance && d.provenance.fetch_source) || d.source;
      if (!newInfo) continue;
      d.info_url = newInfo;
      await d.save();
      updated += 1;
      console.log('Updated', d.name, '->', newInfo);
    }
    console.log('Done. Updated', updated, 'records.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing info_url:', err.message || err);
    process.exit(1);
  }
};

run();
