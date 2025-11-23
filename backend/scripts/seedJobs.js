import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';
import Employer from '../models/employerModel.js';
import Job from '../models/jobModel.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const employersData = [
      { company: 'Sunrise Constructions', email: 'hr@sunrise.example', password: 'password123', phone: '9000000001', industry: 'Construction', location: 'Delhi' },
      { company: 'GreenHarvest Farms', email: 'contact@greenharvest.example', password: 'password123', phone: '9000000002', industry: 'Agriculture', location: 'Uttar Pradesh' },
      { company: 'HomeCare Services', email: 'jobs@homecare.example', password: 'password123', phone: '9000000003', industry: 'Domestic', location: 'Mumbai' },
      { company: 'City Logistics', email: 'ops@citylogistics.example', password: 'password123', phone: '9000000004', industry: 'Logistics', location: 'Bengaluru' },
      { company: 'StitchWorks Tailors', email: 'info@stitchworks.example', password: 'password123', phone: '9000000005', industry: 'Tailoring', location: 'Kolkata' },
      { company: 'QuickDeliver Pvt Ltd', email: 'courier@quickdeliver.example', password: 'password123', phone: '9000000006', industry: 'Delivery', location: 'Hyderabad' },
      { company: 'QuickFix Plumbing', email: 'contact@quickfixplumbing.example', password: 'password123', phone: '9000000010', industry: 'Plumbing', location: 'Delhi' },
      { company: 'Bright Electric', email: 'hr@brightelectric.example', password: 'password123', phone: '9000000011', industry: 'Electrical', location: 'Mumbai' },
      { company: 'Metro Builders Co', email: 'info@metrobuilders.example', password: 'password123', phone: '9000000012', industry: 'Construction', location: 'Bengaluru' },
      { company: 'Laundry Hub Services', email: 'service@laundryhub.example', password: 'password123', phone: '9000000013', industry: 'Laundry', location: 'Kolkata' },
    ];

    const employers = [];
    for (const e of employersData) {
      let employer = await Employer.findOne({ company: e.company });
      if (!employer) {
        const hashed = await bcrypt.hash(e.password, 10);
        employer = await Employer.create({ company: e.company, email: e.email, password: hashed, phone: e.phone, industry: e.industry, location: e.location });
        console.log('Created employer:', e.company);
      } else {
        console.log('Employer exists:', e.company);
      }
      employers.push(employer);
    }

    const jobsData = [
      { title: 'Construction Helper (Daily Wage)', location: 'Delhi', jobType: 'Contract', description: 'Assist masons and labourers on construction sites. Daily wage. No prior experience required.', salaryRange: { min: 300, max: 400 }, requiredSkills: ['Manual Labour'], experience: '0-1 years', employerCompany: 'Sunrise Constructions' },
      { title: 'Farm Labourer - Harvest Season', location: 'Uttar Pradesh', jobType: 'Contract', description: 'Seasonal work for harvesting and field maintenance. Accommodation may be provided.', salaryRange: { min: 350, max: 450 }, requiredSkills: ['Field Work'], experience: '0-1 years', employerCompany: 'GreenHarvest Farms' },
      { title: 'Domestic Help - Part Time', location: 'Mumbai', jobType: 'Part-time', description: 'Household cleaning and assistance. Suitable for local migrants.', salaryRange: { min: 400, max: 600 }, requiredSkills: ['Housekeeping'], experience: '0-2 years', employerCompany: 'HomeCare Services' },
      { title: 'Loader / Unloader - Market', location: 'Kolkata', jobType: 'Full-time', description: 'Loading and unloading goods at wholesale markets. Physically demanding.', salaryRange: { min: 500, max: 700 }, requiredSkills: ['Physical Strength'], experience: '0-1 years', employerCompany: 'StitchWorks Tailors' },
      { title: 'Delivery Rider (Two-wheeler)', location: 'Hyderabad', jobType: 'Full-time', description: 'Deliver parcels within city. Requires two-wheeler and valid driving license.', salaryRange: { min: 600, max: 1000 }, requiredSkills: ['Driving'], experience: '1+ years', employerCompany: 'QuickDeliver Pvt Ltd' },
      { title: 'Tailoring Assistant (Home-based)', location: 'Kolkata', jobType: 'Part-time', description: 'Assist with stitching and finishing garments. Work-from-home options for experienced stitchers.', salaryRange: { min: 300, max: 500 }, requiredSkills: ['Sewing'], experience: '1+ years', employerCompany: 'StitchWorks Tailors' },
      { title: 'Street Vendor Assistant', location: 'Bengaluru', jobType: 'Full-time', description: 'Help vendors with setting up stalls, sales, and packing. Informal sector role.', salaryRange: { min: 300, max: 500 }, requiredSkills: ['Sales'], experience: '0-1 years', employerCompany: 'City Logistics' },
      { title: 'Brick Kiln Worker', location: 'Uttar Pradesh', jobType: 'Contract', description: 'Work at brick kilns; seasonal work with accommodation. Physically intensive.', salaryRange: { min: 300, max: 450 }, requiredSkills: ['Manual Labour'], experience: '0-2 years', employerCompany: 'Sunrise Constructions' },
      // Additional trades requested: plumbing, electrician, construction worker, laundry
      { title: 'Plumber - Residential Repairs', location: 'Delhi', jobType: 'Full-time', description: 'Fix and maintain residential plumbing. Basic tools provided.', salaryRange: { min: 500, max: 800 }, requiredSkills: ['Plumbing', 'Pipe Fitting'], experience: '1+ years', employerCompany: 'QuickFix Plumbing' },
      { title: 'Electrician - Maintenance', location: 'Mumbai', jobType: 'Full-time', description: 'Handle general electrical repairs and maintenance in residential buildings.', salaryRange: { min: 550, max: 900 }, requiredSkills: ['Electrical Repairs'], experience: '1+ years', employerCompany: 'Bright Electric' },
      { title: 'Construction Worker - General', location: 'Bengaluru', jobType: 'Contract', description: 'General construction site work - carrying, mixing, basic carpentry support.', salaryRange: { min: 350, max: 600 }, requiredSkills: ['Manual Labour'], experience: '0-1 years', employerCompany: 'Metro Builders Co' },
      { title: 'Skilled Construction Helper (Mason Assistant)', location: 'Delhi', jobType: 'Contract', description: 'Assist masons with skilled tasks; some experience preferred.', salaryRange: { min: 600, max: 900 }, requiredSkills: ['Masonry Assistance'], experience: '1+ years', employerCompany: 'Sunrise Constructions' },
      { title: 'Laundry Worker - Washer/Presser', location: 'Kolkata', jobType: 'Full-time', description: 'Operate washing machines, press and fold garments. Suitable for local workers.', salaryRange: { min: 300, max: 500 }, requiredSkills: ['Garment Handling'], experience: '0-1 years', employerCompany: 'Laundry Hub Services' },
      { title: 'Dry Cleaning Assistant', location: 'Kolkata', jobType: 'Part-time', description: 'Assist with dry-cleaning operations and customer pickups.', salaryRange: { min: 350, max: 500 }, requiredSkills: ['Customer Service'], experience: '0-1 years', employerCompany: 'Laundry Hub Services' },
    ];

    let created = 0;
    for (const j of jobsData) {
      const emp = employers.find((x) => x.company === j.employerCompany);
      if (!emp) continue;

      const exists = await Job.findOne({ title: j.title, employer: emp._id });
      if (exists) {
        console.log('Job exists, skipping:', j.title);
        continue;
      }

      await Job.create({
        employer: emp._id,
        title: j.title,
        location: j.location,
        jobType: j.jobType,
        description: j.description,
        salaryRange: j.salaryRange,
        requiredSkills: j.requiredSkills,
        experience: j.experience,
        status: 'active',
      });
      console.log('Created job:', j.title);
      created++;
    }

    console.log(`Seeding complete. Employers ensured: ${employers.length}. Jobs created: ${created}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

run();
