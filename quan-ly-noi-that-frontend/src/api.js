// Simple API wrapper using fetch
// - Reads base URL from REACT_APP_API_BASE_URL or defaults to http://localhost:8080
// - Attaches JSON headers and optional Authorization header from localStorage('authToken')
// - Exposes helper functions: get, post, put, del

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

function buildUrl(path, query) {
  const url = path.startsWith('http') ? path : `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  if (!query) return url;
  const params = new URLSearchParams(query).toString();
  return params ? `${url}?${params}` : url;
}

function authHeader() {
  try {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
}

async function request(method, path, { body, query, headers } = {}) {
  const url = buildUrl(path, query);
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...headers
  };

  const opts = {
    method,
    headers: baseHeaders
  };

  if (body !== undefined && body !== null) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, opts) => request('POST', path, opts),
  put: (path, opts) => request('PUT', path, opts),
  del: (path, opts) => request('DELETE', path, opts),
  buildUrl
};

export default api;
