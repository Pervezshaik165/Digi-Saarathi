import natural from "natural";
import User from "../models/userModel.js";
import Job from "../models/jobModel.js";

// Helper: compute cosine similarity between two documents using natural TfIdf
function cosineTfidf(tfidf, idxA, idxB) {
  const termsA = tfidf.listTerms(idxA);
  const termsB = tfidf.listTerms(idxB);

  const mapA = {};
  const mapB = {};
  let sqA = 0;
  let sqB = 0;

  termsA.forEach(t => {
    mapA[t.term] = t.tfidf;
    sqA += t.tfidf * t.tfidf;
  });
  termsB.forEach(t => {
    mapB[t.term] = t.tfidf;
    sqB += t.tfidf * t.tfidf;
  });

  if (sqA === 0 || sqB === 0) return 0;

  let dot = 0;
  for (const term in mapA) {
    if (mapB[term]) dot += mapA[term] * mapB[term];
  }

  return dot / (Math.sqrt(sqA) * Math.sqrt(sqB));
}

function jaccardOverlap(arrA = [], arrB = []) {
  const a = new Set((arrA || []).map(s => (s || "").toLowerCase().trim()));
  const b = new Set((arrB || []).map(s => (s || "").toLowerCase().trim()));
  if (a.size === 0 && b.size === 0) return 0;
  const inter = new Set([...a].filter(x => b.has(x))).size;
  const uni = new Set([...a, ...b]).size;
  return uni === 0 ? 0 : inter / uni;
}

// Normalize text: lowercase, remove extra punctuation, split tokens
function tokenizeText(text = "") {
  return (text || "").toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Return stemmed, normalized string for TF-IDF
function normalizeAndStem(text = "") {
  const tokens = tokenizeText(text);
  return tokens.map(t => natural.PorterStemmer.stem(t)).join(' ');
}

// Fuzzy skill matching using Jaro-Winkler similarity
function fuzzySkillScore(userSkills = [], jobSkills = [], threshold = 0.85) {
  const u = (userSkills || []).map(s => (s || '').toLowerCase().trim());
  const j = (jobSkills || []).map(s => (s || '').toLowerCase().trim());
  if (!u.length && !j.length) return 0;

  let matches = 0;
  const used = new Set();
  for (const us of u) {
    let best = { score: 0, idx: -1 };
    for (let k = 0; k < j.length; k++) {
      if (used.has(k)) continue;
      const js = j[k];
      const score = natural.JaroWinklerDistance(us, js);
      if (score > best.score) best = { score, idx: k };
    }
    if (best.score >= threshold && best.idx >= 0) {
      matches += 1;
      used.add(best.idx);
    }
  }
  const union = new Set([...u, ...j]).size || 1;
  return Math.min(1, matches / union);
}

function parseYears(text) {
  if (!text) return null;
  const m = text.match(/(\d+(?:\.\d+)?)/g);
  if (!m) return null;
  // prefer the first or max value
  const nums = m.map(n => parseFloat(n));
  return Math.max(...nums);
}

// Controller: compute recommendations for logged-in user
export const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const jobs = await Job.find({ status: "active" }).populate('employer').lean();

    // Build normalized + stemmed texts for TF-IDF
    const jobDocs = jobs.map(j => {
      const skills = (j.requiredSkills || []).join(' ');
      const raw = `${j.title || ''} ${j.description || ''} ${skills} ${j.location || ''}`.trim();
      return normalizeAndStem(raw);
    });

    const userText = normalizeAndStem(`${(user.skills || []).join(' ')} ${user.address || ''} ${user.name || ''}`.trim());

    // TF-IDF: add job docs, then user doc as last
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    jobDocs.forEach(d => tfidf.addDocument(d));
    tfidf.addDocument(userText);
    const userDocIndex = jobDocs.length; // last index

    // compute scores
    const results = jobs.map((job, i) => {
      // TF-IDF similarity (using stemmed/normalized text)
      const tfidfScore = cosineTfidf(tfidf, i, userDocIndex) || 0;

      // Skills overlap (fuzzy matching with Jaro-Winkler)
      const skillsScore = fuzzySkillScore(user.skills || [], job.requiredSkills || [], 0.85);

      // Experience proximity
      const userExp = parseYears(user.experience || user.experienceYears || '');
      const jobExp = parseYears(job.experience || '');
      let expScore = 0.5; // default neutral
      if (userExp != null && jobExp != null) {
        const gap = Math.abs(userExp - jobExp);
        expScore = Math.max(0, 1 - gap / Math.max(1, jobExp));
      }

      // Location match (exact / partial)
      let locScore = 0;
      if (user.address && job.location) {
        const ua = (user.address || '').toLowerCase();
        const jl = (job.location || '').toLowerCase();
        if (jl === ua) locScore = 1;
        else if (jl.includes(ua) || ua.includes(jl)) locScore = 0.6;
        else locScore = 0;
      } else {
        locScore = 0.5; // unknown
      }

      // Salary match (simple check if a salary preference is provided either in request body or user profile)
      let salScore = 0.5;
      // Allow request override: req.body.salaryPreference (sent by frontend)
      const reqPref = req.body && (req.body.salaryPreference || (req.body.salaryMin || req.body.salaryMax) ? (req.body.salaryPreference || ((req.body.salaryMin ? Number(req.body.salaryMin) : 0) + (req.body.salaryMax ? Number(req.body.salaryMax) : 0)) / ((req.body.salaryMin && req.body.salaryMax) ? 2 : 1)) : null);
      const pref = (typeof reqPref === 'number' && !Number.isNaN(reqPref)) ? reqPref : user.salaryPreference;
      if (pref && job.salaryRange && job.salaryRange.min) {
        if (pref <= job.salaryRange.max && pref >= job.salaryRange.min) salScore = 1;
        else salScore = 1 - Math.min(Math.abs(pref - (job.salaryRange.min || pref)), Math.abs(pref - (job.salaryRange.max || pref))) / Math.max(1, pref);
        salScore = Math.max(0, Math.min(1, salScore));
      }

      // Weighted sum
      const weights = {
        skills: 0.45,
        tfidf: 0.20,
        exp: 0.20,
        loc: 0.10,
        sal: 0.05
      };

      const finalScore = (weights.skills * skillsScore) + (weights.tfidf * tfidfScore) + (weights.exp * expScore) + (weights.loc * locScore) + (weights.sal * salScore);

      return {
        job,
        score: finalScore,
        components: {
          skills: skillsScore,
          tfidf: tfidfScore,
          exp: expScore,
          loc: locScore,
          sal: salScore
        }
      };
    });

    // sort and pick top 3
    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, 3).map(r => ({ job: r.job, scorePercent: Math.round(r.score * 100), components: r.components }));

    return res.json({ success: true, recommended: top });
  } catch (error) {
    console.error('Recommendation error', error);
    return res.status(500).json({ success: false, message: 'Failed to compute recommendations' });
  }
};

export default { getJobRecommendations };
