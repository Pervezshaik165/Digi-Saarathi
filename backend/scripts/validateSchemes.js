#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Scheme from '../models/schemeModel.js';

dotenv.config();

const requiredFields = ['name', 'short_description', 'scope', 'apply_url', 'info_url'];

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — validating schemes...');
    const total = await Scheme.countDocuments();
    const byScope = await Scheme.aggregate([{ $group: { _id: '$scope', count: { $sum: 1 } } }]);
    const byState = await Scheme.aggregate([{ $match: { scope: 'state' } }, { $group: { _id: '$state.name', count: { $sum: 1 } } }]);
    const needReview = await Scheme.countDocuments({ requires_manual_review: true });

    const missing = {};
    for (const f of requiredFields) missing[f] = 0;

    const cursor = Scheme.find().cursor();
    for await (const doc of cursor) {
      for (const f of requiredFields) {
        if (!doc[f]) missing[f] += 1;
      }
    }

    console.log('\nValidation Report');
    console.log('-----------------');
    console.log('Total schemes:', total);
    console.log('By scope:');
    for (const s of byScope) console.log(` - ${s._id || 'unknown'}: ${s.count}`);
    console.log('By state (state-scoped):');
    for (const s of byState) console.log(` - ${s._id || 'unknown'}: ${s.count}`);
    console.log('Requires manual review:', needReview);
    console.log('\nMissing required fields (counts):');
    for (const f of requiredFields) console.log(` - ${f}: ${missing[f]}`);

    // Print small sample of records needing review
    const flagList = await Scheme.find({ requires_manual_review: true }).limit(20).select('name scope state apply_url info_url');
    console.log('\nSample records flagged for manual review (up to 20):');
    flagList.forEach(r => console.log(` - ${r.name} [${r.scope}] ${r.state ? JSON.stringify(r.state) : ''} -> ${r.info_url || r.apply_url}`));

    process.exit(0);
  } catch (err) {
    console.error('Validation error:', err.message || err);
    process.exit(1);
  }
};

run();
