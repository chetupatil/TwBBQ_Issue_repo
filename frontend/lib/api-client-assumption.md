ASSUMPTION: the app already has an authenticated API client, e.g.:

  // lib/apiClient.ts (existing)
  import axios from 'axios';
  export const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
  apiClient.interceptors.request.use((config) => {
    const token = getStoredJwt(); // however the app currently stores it
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

The pages below import `apiClient` from `'@/lib/apiClient'` and do nothing
with the JWT themselves — no token handling, no venue filtering — the
backend guard is the only authorization boundary, per the constraint. If the
real client lives at a different path/name, only the import line changes.
