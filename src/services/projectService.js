import api, { buildFormData } from "./api";

export const projectService = {
  getGithub: async () => {
    const [repos, local] = await Promise.all([api.get("/admin/projects/github"), api.get("/project")]);
    if (!Array.isArray(repos.data.data) || !Array.isArray(local.data.data)) throw new Error("Respons daftar proyek tidak valid.");
    const ids = new Map(local.data.data.filter(p => p.github_id != null).map(p => [String(p.github_id), p.id]));
    const github = repos.data.data.map(repo => ({ ...repo, id: ids.get(String(repo.github_id)) ?? null, is_active: [true, 1, "1"].includes(repo.is_active) }));
    const manual = local.data.data.filter(p => p.github_id == null && [true, 1, "1"].includes(p.is_showcase)).map(p => ({ ...p, is_active: [true, 1, "1"].includes(p.is_active), manual: true }));
    return [...manual, ...github];
  },

  setManualVisibility: async (id, isActive) => {
    const res = await api.post(`/admin/projects/manual/${id}/visibility`, { is_active: isActive });
    return res.data.data;
  },

  syncGithub: async () => {
    const res = await api.post("/admin/projects/sync");
    return res.data.data;
  },

  setVisibility: async (githubId, isActive) => {
    const res = await api.post(`/admin/projects/${githubId}/visibility`, { is_active: isActive });
    return res.data.data;
  },

  getAll: async () => {
    const res = await api.get("/project");
    return res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/project/${id}`);
    return res.data.data;
  },

  create: async (payload) => {
    const formData = buildFormData(payload);
    const res = await api.post("/project", formData);
    return res.data.data;
  },

  update: async (id, payload) => {
    const formData = buildFormData(payload, true);
    const res = await api.post(`/project/${id}`, formData);
    return res.data.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/project/${id}`);
    return res.data.message;
  },

  addGambar: async (projectId, files) => {
    const formData = buildFormData({ gambar: files });
    const res = await api.post(`/project/${projectId}/gambar`, formData);
    return res.data.data;
  },

  removeGambar: async (gambarId) => {
    const res = await api.delete(`/project/gambar/${gambarId}`);
    return res.data.message;
  },
};
