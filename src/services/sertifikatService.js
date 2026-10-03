import api, { buildFormData } from "./api";

export const sertifikatService = {
  getAll: async () => {
    const res = await api.get("/sertifikat");
    return res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/sertifikat/${id}`);
    return res.data.data;
  },

  create: async (payload) => {
    const formData = buildFormData(payload);
    const res = await api.post("/sertifikat", formData);
    return res.data.data;
  },

  update: async (id, payload) => {
    const formData = buildFormData(payload, true);
    const res = await api.post(`/sertifikat/${id}`, formData);
    return res.data.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/sertifikat/${id}`);
    return res.data.message;
  },
};
