#!/usr/bin/env node
import dotenv from "dotenv";
import axios from "axios";
import connectDB from "../config/db.js";
import Scheme from "../models/schemeModel.js";

dotenv.config();

const DATA_GOV_BASE = "https://data.gov.in/api";
// Example dataset: You may need to search data.gov.in for authoritative scheme datasets.
// This script attempts to fetch a dataset if DATA_GOV_RESOURCE_ID is set.

const main = async () => {
  try {
    await connectDB();
    console.log("Connected to DB, starting ingestion...");

    const resourceId = process.env.DATA_GOV_RESOURCE_ID;
    if (!resourceId) {
      console.error("Please set DATA_GOV_RESOURCE_ID in .env to fetch a sample dataset.");
      process.exit(1);
    }

    const apiKey = process.env.DATA_GOV_API_KEY || "";
    const url = `${DATA_GOV_BASE}/action/datastore_search?resource_id=${resourceId}&limit=100`;

    const headers = {};
    if (apiKey) headers.apikey = apiKey;

    const res = await axios.get(url, { headers });
    const records = res.data.result && res.data.result.records ? res.data.result.records : [];
    console.log(`Fetched ${records.length} records from data.gov.in`);

    let inserted = 0;
    let updated = 0;

    for (const raw of records) {
      // Basic mapping: try to find name, description and apply URL from known fields
      const name = raw.name || raw.title || raw.scheme_name || raw.Scheme || raw.Scheme_Name;
      if (!name) continue; // skip records without a name

      const mapped = {
        name: String(name).trim(),
        short_description: raw.short_description || raw.summary || raw.description || "",
        full_description: raw.description || raw.full_description || "",
        scope: raw.scope || "central",
        state: raw.state ? { code: raw.state, name: raw.state } : undefined,
        categories: raw.category ? [raw.category] : [],
        eligibility_text: raw.eligibility || raw.eligibility_criteria || "",
        documents_required: raw.documents ? (Array.isArray(raw.documents) ? raw.documents : [raw.documents]) : [],
        apply_url: raw.apply_url || raw.url || raw.link || raw.website || raw.official_website || "",
        info_url: raw.info_url || raw.url || raw.website || "",
        source: "data.gov.in",
        source_id: raw._id || raw.id || raw.resource_id || undefined,
        provenance: { raw, fetched_at: new Date(), fetch_source: "data.gov.in" },
      };

      // Build upsert key
      const key = { source: mapped.source };
      if (mapped.source_id) key.source_id = mapped.source_id;
      else key.name = mapped.name;

      const existing = await Scheme.findOne(key);
      if (existing) {
        await Scheme.findOneAndUpdate(key, { $set: mapped });
        updated++;
      } else {
        const s = new Scheme(mapped);
        await s.save();
        inserted++;
      }
    }

    console.log(`Ingestion complete. Inserted: ${inserted}, Updated: ${updated}`);
    process.exit(0);
  } catch (error) {
    console.error("Ingestion error:", error.message || error);
    process.exit(1);
  }
};

main();
