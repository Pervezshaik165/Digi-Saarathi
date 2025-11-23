import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const RecommendationCard = ({ rec }) => {
  const { job, scorePercent } = rec;
  return (
    <div className="bg-white border rounded p-3 shadow-sm">
      <div className="flex justify-between">
        <div>
          <h4 className="font-semibold">{job.title}</h4>
          <p className="text-sm text-gray-600">{job.employer?.company} • {job.location}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Match</div>
          <div className="text-lg font-semibold">{scorePercent}%</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 mt-2">{job.description ? job.description.slice(0, 140) + (job.description.length>140? '...':'') : 'No description'}</p>
    </div>
  );
};

const AIJobSearchBox = () => {
  const { api, userToken } = useContext(AppContext);
  const [running, setRunning] = useState(false);
  const [recs, setRecs] = useState([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  const runSearch = async () => {
    if (!userToken) {
      toast.info('Please login to run AI job search');
      return;
    }
    try {
      setRunning(true);
      // Prepare optional salary preference (average of min/max if provided)
      const body = {};
      const min = salaryMin ? Number(salaryMin) : null;
      const max = salaryMax ? Number(salaryMax) : null;
      if (min && max) body.salaryPreference = Math.round((min + max) / 2);
      else if (min) body.salaryPreference = min;
      else if (max) body.salaryPreference = max;

      const res = await api.post('/api/user/recommendations', body, { headers: { Authorization: `Bearer ${userToken}` } });
      if (res.data.success) {
        setRecs(res.data.recommended || []);
        if (!(res.data.recommended || []).length) toast.info('No strong recommendations found');
      } else {
        toast.error('Failed to get recommendations');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Recommendation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded shadow flex items-center justify-between w-full">
        <div>
          <h3 className="text-lg font-semibold">Smart Job Matching Using AI</h3>
          <p className="text-sm text-gray-600">Top 3 jobs matched to your profile (skills, experience, location, salary range).</p>
        </div>
        <div>
          <button
            onClick={runSearch}
            disabled={running}
            aria-label="Find top job matches for your profile"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {running ? 'Finding best matches...' : 'Find my top matches'}
          </button>
        </div>
          <div className="ml-4 flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min ₹"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              min="0"
              placeholder="Max ₹"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

      {recs && recs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {recs.map((r, i) => (
            <RecommendationCard key={i} rec={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIJobSearchBox;
