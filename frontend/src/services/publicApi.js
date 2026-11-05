const apiBaseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')).replace(/\/+$/, '');

export async function getPublicData(path) {
  const endpoint = `${apiBaseUrl}/${path.replace(/^\/+/, '')}`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Public API request failed (${response.status}).`);
  }

  return data;
}
