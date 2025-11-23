#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Scheme from '../models/schemeModel.js';

dotenv.config();

const samples = [
  {
    name: 'Pradhan Mantri Jan Dhan Yojana',
    short_description: 'Financial inclusion program for bank accounts',
    full_description: 'PMJDY aims to provide access to financial services such as banking & savings accounts, remittance, credit, insurance and pension to the excluded population.',
    scope: 'central',
    categories: ['finance', 'inclusion'],
    eligibility_text: 'Any adult without an existing bank account can apply',
    documents_required: ['Aadhaar', 'Address proof'],
    apply_url: 'https://pmjdy.gov.in',
    info_url: 'https://pmjdy.gov.in',
    source: 'manual-seed',
    source_id: 'seed-pmjd',
    provenance: { fetched_at: new Date(), fetch_source: 'seed' },
    verified: true,
  },
  {
    name: 'State Widow Pension Scheme (Karnataka)',
    short_description: 'Pension for widows in Karnataka',
    full_description: 'Monthly pension for widows who meet state eligibility rules.',
    scope: 'state',
    state: { code: 'KA', name: 'Karnataka' },
    categories: ['pension', 'welfare'],
    eligibility_text: 'Widows resident in Karnataka with income below threshold',
    documents_required: ['Aadhaar', 'Domicile certificate'],
    apply_url: 'https://karnataka.gov.in/widow-pension',
    source: 'manual-seed',
    source_id: 'seed-ka-widow-01',
    provenance: { fetched_at: new Date(), fetch_source: 'seed' },
    verified: false,
  },
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    short_description: 'Income support for farmers',
    full_description: 'Provides income support to landholding farmer families.',
    scope: 'central',
    categories: ['agriculture', 'income_support'],
    eligibility_text: 'Small and marginal farmers as defined by govt.',
    documents_required: ['Aadhaar', 'Land records'],
    apply_url: 'https://pmkisan.gov.in',
    source: 'manual-seed',
    source_id: 'seed-pm-kisan',
    provenance: { fetched_at: new Date(), fetch_source: 'seed' },
    verified: true,
  }
];

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB, seeding sample schemes...');

    for (const s of samples) {
      const key = { source: s.source, source_id: s.source_id };
      const existing = await Scheme.findOne(key);
      if (existing) {
        await Scheme.findOneAndUpdate(key, { $set: s });
        console.log('Updated:', s.name);
      } else {
        const doc = new Scheme(s);
        await doc.save();
        console.log('Inserted:', s.name);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message || err);
    process.exit(1);
  }
};

run();
