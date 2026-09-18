import axios from "axios";

// Public reads must not inherit the admin token or login redirects.
const publicApi = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL, timeout: 20000 });

export const portofolioService = {
  get: async (signal) => {
    const res = await publicApi.get("/portofolio", { signal });
    return res.data.data ?? res.data;
  },
};
