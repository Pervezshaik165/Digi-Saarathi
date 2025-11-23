import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const AadhaarUrl = 'https://uidai.gov.in';
const VoterUrl = 'https://www.nvsp.in/';

const SchemeCard = ({ scheme, onInfo }) => {
  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{scheme.name}</h3>
          <p className="text-sm text-gray-600">{scheme.scope}{scheme.state?.name ? ` • ${scheme.state.name}` : ''}</p>
          <p className="mt-2 text-sm text-gray-700">{scheme.short_description || scheme.eligibility_text || 'No description available.'}</p>
          <div className="mt-2 flex items-center gap-2">
            {scheme.categories && scheme.categories.slice(0,2).map((c, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{c}</span>
            ))}
            {scheme.benefit?.amount && <span className="text-xs px-2 py-0.5 bg-green-50 rounded">₹{scheme.benefit.amount}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => onInfo(scheme)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Details</button>
          {scheme.apply_url && (
            <a href={scheme.apply_url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded text-sm text-center">Apply</a>
          )}
        </div>
      </div>
    </div>
  )
}

const Schemes = () => {
  const { api } = useContext(AppContext);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [caste, setCaste] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [tab, setTab] = useState('all');
  const [income, setIncome] = useState('all');
  const [stateCode, setStateCode] = useState('');
  const [fetchError, setFetchError] = useState(null);
  // Preferred category ordering and human-friendly labels
  const preferredCategories = [
    'health',
    'employment',
    'pension',
    'finance',
    'skill',
    'housing',
    'welfare',
    'education',
    'agriculture',
    'food_security',
    'social_security',
    'enterprise',
    'innovation',
  ];

  const prettyCategory = (c) => {
    if (!c) return '';
    return String(c).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const indiaStates = [
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'CT', name: 'Chhattisgarh' },
    { code: 'DL', name: 'Delhi' },
    { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'LA', name: 'Ladakh' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MN', name: 'Manipur' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'PY', name: 'Puducherry' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
  ];

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      // request a large limit so we get all schemes present in the DB for the page
      const res = await api.get('/api/schemes?limit=10000');
      const items = res.data?.data || [];
      // keep canonical shape; frontend can rely on these fields
      const mapped = items.map(s => ({
        ...s,
        categories: s.categories || [],
        short_description: s.short_description || s.full_description || '',
      }));
      setSchemes(mapped);
    } catch (err) {
      console.error(err);
      setFetchError(err?.message || 'Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setStateCode('')
    setSelectedStateCode('')
    setTab('all')
    setIncome('all')
    setCaste('')
  }

  const filterEligible = (s) => {
    // Improved eligibility matcher:
    // - stateCode: match against state.code OR state.name (case-insensitive) OR include central-scope schemes
    // - income: look for several common keywords (BPL/APL) in eligibility text and descriptions
    if (stateCode) {
      const q = stateCode.trim().toLowerCase();
      const stateName = (s.state && s.state.name && String(s.state.name).toLowerCase()) || '';
      const stateCodeField = (s.state && s.state.code && String(s.state.code).toLowerCase()) || '';
      const isCentral = s.scope === 'central' || s.scope === undefined;
      if (!(isCentral || stateName.includes(q) || stateCodeField === q)) return false;
    }

    if (income === 'all') return true;
    const text = ((s.eligibility_text || s.full_description || s.short_description) || '').toLowerCase();
    if (income === 'bpl') {
      // common ways BPL is written
      return /bpl|below poverty|below-poverty|below poverty line/.test(text);
    }
    if (income === 'apl') {
      return /apl|above poverty|above-poverty|above poverty line/.test(text);
    }
    // fallback: if we don't know, be conservative and return false for eligible tab
    return false;
  };

  const filtered = schemes.filter(s => {
    const matchesTab = tab === 'all' ? true : filterEligible(s);
    const matchesSearch = searchQuery.trim() === '' || (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) || (s.short_description && s.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || (s.categories && s.categories.includes(selectedCategory));
    return matchesTab && matchesSearch && matchesCategory;
  });
  const shown = filtered;

  if (loading) return <div className="p-6">Loading schemes...</div>;
  if (fetchError) return <div className="p-6 text-red-600">{fetchError}</div>;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Schemes</h1>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4 flex-wrap items-center">
          <input placeholder="Search schemes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border rounded p-2 flex-1 min-w-[200px]" />

          <input placeholder="State code or name" value={stateCode} onChange={e => setStateCode(e.target.value)} className="border rounded p-2" />

          <div className="flex gap-2">
            <button onClick={() => setTab('all')} className={`px-3 py-1 rounded ${tab==='all' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>All</button>
            <button onClick={() => setTab('eligible')} className={`px-3 py-1 rounded ${tab==='eligible' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Eligible</button>
          </div>
        </div>

        {/* category quick filters (preferred order, then derived) */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={() => setSelectedCategory('')} className={`text-sm px-3 py-1 rounded ${selectedCategory==='' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>All Categories</button>
          {(() => {
            const derived = [...new Set(schemes.flatMap((s) => s.categories || []))];
            const merged = [...new Set([...preferredCategories, ...derived])];
            return merged.slice(0, 14).map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm px-3 py-1 rounded ${selectedCategory===cat ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                {prettyCategory(cat)}
              </button>
            ));
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          {shown.length === 0 ? (
            <div className="bg-white p-8 rounded shadow text-center">No schemes found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shown.map(s => <SchemeCard key={s._id} scheme={s} onInfo={(sc) => setSelectedScheme(sc)} />)}
            </div>
          )}
        </div>

        {/* Sidebar controls: caste, income, identity updates, apply */}
        <aside className="lg:col-span-3 bg-white p-4 rounded shadow sticky top-6">
          <h3 className="font-semibold mb-3">Controls</h3>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">State</label>
            <select value={selectedStateCode} onChange={e => setSelectedStateCode(e.target.value)} className="w-full border rounded p-2">
              <option value="">All states</option>
              {indiaStates.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              onClick={() => {
                if (!selectedStateCode) return;
                // set the top stateCode search and switch to Eligible tab
                setStateCode(selectedStateCode);
                setTab('eligible');
              }}
              className={`flex-1 px-3 py-2 rounded text-white ${selectedStateCode ? 'bg-indigo-600' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Find State Schemes
            </button>
            <button onClick={resetFilters} className="px-3 py-2 rounded bg-gray-200">Reset / Show All</button>
          </div>

          <div className="mb-3">
            <button onClick={() => window.open(AadhaarUrl, '_blank')} className="w-full px-3 py-2 bg-yellow-500 text-white rounded mb-2">Update Aadhaar</button>
            <button onClick={() => window.open(VoterUrl, '_blank')} className="w-full px-3 py-2 bg-blue-600 text-white rounded">Update Voter ID</button>
          </div>

          <div className="mb-3">
            <button
              onClick={() => {
                if (!selectedStateCode) return;
                const state = indiaStates.find(s => s.code === selectedStateCode);
                const q = encodeURIComponent(`${state?.name || selectedStateCode} caste certificate apply`);
                window.open(`https://www.google.com/search?q=${q}`, '_blank');
              }}
              className={`w-full px-3 py-2 rounded text-white ${selectedStateCode ? 'bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!selectedStateCode}
            >
              Apply for Caste Certificate (State)
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                if (!selectedStateCode) return;
                const state = indiaStates.find(s => s.code === selectedStateCode);
                const q = encodeURIComponent(`${state?.name || selectedStateCode} income certificate apply`);
                window.open(`https://www.google.com/search?q=${q}`, '_blank');
              }}
              className={`w-full px-3 py-2 rounded text-white ${selectedStateCode ? 'bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!selectedStateCode}
            >
              Apply for Income Certificate (State)
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">Tip: select a state, click "Find State Schemes" to view eligible state schemes. Use the Apply buttons to open guidance for caste/income certificates for that state.</div>
        </aside>
      </div>

      {selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedScheme.name}</h2>
                <p className="text-sm text-gray-600">{selectedScheme.scope}{selectedScheme.state?.name ? ` • ${selectedScheme.state.name}` : ''}</p>
              </div>
              <button onClick={() => setSelectedScheme(null)} className="text-gray-500">Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-gray-700">{selectedScheme.full_description || selectedScheme.short_description || 'No detailed description.'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Eligibility</h4>
                <p className="text-gray-700">{selectedScheme.eligibility_text || 'Eligibility details not available.'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Documents Required</h4>
                {selectedScheme.documents_required && selectedScheme.documents_required.length ? (
                  <ul className="list-disc ml-5 text-gray-700">
                    {selectedScheme.documents_required.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                ) : <p className="text-gray-700">Not specified.</p>}
              </div>

              <div>
                <small className="text-gray-500">Source: {selectedScheme.source || 'unknown'} • Last fetched: {selectedScheme.provenance?.fetched_at ? new Date(selectedScheme.provenance.fetched_at).toLocaleString() : 'unknown'}</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
