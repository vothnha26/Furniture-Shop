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

let _cachedAuthToken = null;

function authHeader() {
  try {
    const token = _cachedAuthToken ?? localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
}

function setAuthToken(token) {
  _cachedAuthToken = token;
}

function clearAuthToken() {
  _cachedAuthToken = null;
}

async function request(method, path, { body, query, headers } = {}) {
  const url = buildUrl(path, query);

  // Kiểm tra nếu body là FormData thì không set Content-Type (browser tự set)
  const isFormData = body instanceof FormData;

  const baseHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeader(),
    ...headers
  };

  const opts = {
    method,
    headers: baseHeaders,
    // include credentials so session cookies set by backend are stored by the browser
    credentials: 'include'
  };

  if (body !== undefined && body !== null) {
    // Nếu là FormData hoặc string thì gửi trực tiếp, không thì JSON.stringify
    opts.body = isFormData || typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Debug: log outgoing request headers for auth troubleshooting
  try {
    // avoid logging bodies that may contain sensitive data
    console.debug('[api] ->', method, url, { headers: opts.headers, credentials: opts.credentials });
  } catch (e) {}

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
    try { console.debug('[api] <- ERROR', method, url, { status: res.status, body: data }); } catch (e) {}
    throw err;
  }

  try { console.debug('[api] <-', method, url, { status: res.status, body: data }); } catch (e) {}

  return data;
}

function normalizeOpts(bodyOrOpts) {
  // If caller passed an options object with keys like body/query/headers, use it.
  if (!bodyOrOpts) return {};
  if (typeof bodyOrOpts === 'object' && ('body' in bodyOrOpts || 'query' in bodyOrOpts || 'headers' in bodyOrOpts)) {
    return bodyOrOpts;
  }
  // Otherwise treat the argument as the request body directly
  return { body: bodyOrOpts };
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, bodyOrOpts) => request('POST', path, normalizeOpts(bodyOrOpts)),
  put: (path, bodyOrOpts) => request('PUT', path, normalizeOpts(bodyOrOpts)),
  patch: (path, bodyOrOpts) => request('PATCH', path, normalizeOpts(bodyOrOpts)),
  del: (path, opts) => request('DELETE', path, opts),
  // Download binary content (returns a Blob). This helper includes auth headers and credentials.
  download: async (path, { query, headers, method } = {}) => {
    const url = buildUrl(path, query);
    const opts = {
      method: method || 'GET',
      headers: {
        ...(headers || {}),
        ...authHeader()
      },
      credentials: 'include'
    };
    const res = await fetch(url, opts);
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      const err = new Error(`HTTP ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    const blob = await res.blob();
    return blob;
  },
  // helpers to set/clear in-memory token used by authHeader()
  setAuthToken,
  clearAuthToken,
  buildUrl
};

export default api;
