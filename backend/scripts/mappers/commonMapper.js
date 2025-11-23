export function mapCommon(record, sourceMeta = {}) {
  // Try common field names and fallbacks
  const get = (...keys) => {
    for (const k of keys) {
      if (!k) continue;
      if (Object.prototype.hasOwnProperty.call(record, k) && record[k] != null) return record[k];
      // case-insensitive
      const foundKey = Object.keys(record).find(rk => rk.toLowerCase() === k.toLowerCase());
      if (foundKey) return record[foundKey];
    }
    return undefined;
  };

  const name = get('name', 'title', 'scheme_name', 'scheme');
  const short_description = get('short_description', 'summary', 'description') || (typeof name === 'string' ? name : undefined);
  const full_description = get('full_description', 'description', 'details', 'about');
  const apply_url = get('apply_url', 'applylink', 'apply_link', 'website', 'url', 'link');
  const info_url = get('info_url', 'info', 'info_link') || apply_url;
  const eligibility_text = get('eligibility', 'eligibility_text', 'eligibility_criteria', 'who_can_apply');
  const documents_required = get('documents_required', 'documents', 'required_documents') || [];
  const categories = get('categories', 'category', 'scheme_category') || [];
  const scope = sourceMeta.scope || get('scope') || 'central';
  const state = sourceMeta.state || get('state') || undefined;

  return {
    name: typeof name === 'string' ? name : JSON.stringify(name).slice(0, 200),
    short_description: typeof short_description === 'string' ? short_description : undefined,
    full_description: typeof full_description === 'string' ? full_description : undefined,
    apply_url: typeof apply_url === 'string' ? apply_url : undefined,
    info_url: typeof info_url === 'string' ? info_url : undefined,
    eligibility_text: typeof eligibility_text === 'string' ? eligibility_text : undefined,
    documents_required: Array.isArray(documents_required) ? documents_required : (documents_required ? [documents_required] : []),
    categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
    scope,
    state,
  };
}

export default { mapCommon };
