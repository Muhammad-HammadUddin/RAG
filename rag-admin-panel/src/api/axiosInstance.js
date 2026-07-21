import axios from 'axios';

/**
 * This file represents your EXISTING axios instance.
 *
 * If your project already has a configured axios instance elsewhere
 * (e.g. src/lib/axios.js, src/services/axiosInstance.js), delete this
 * file and update the import in `src/api/knowledgeApi.js` to point to
 * your real instance instead. Nothing else in this project needs to
 * change — every API call goes through `knowledgeApi.js`, never
 * through axios directly.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

export default axiosInstance;
