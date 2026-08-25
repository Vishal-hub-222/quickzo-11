const configuredUrl = import.meta.env.VITE_API_URL || 'https://quickzo.onrender.com';

// Remove a trailing slash so callers can safely append endpoint paths.
export const API_URL = configuredUrl.replace(/\/$/, '');

export async function getResponseData(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status}).`);
  }

  return data;
}
