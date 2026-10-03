import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { projectService } from "../../../services/projectService";
import { getStorageUrl } from "../../../utils/formatUrl";
import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";
import FileInput from "../../../components/common/FileInput";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";

const emptyForm = {
  nama: "",
  deskripsi: "",
  fitur: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  status: "",
  link_github: "",
  link_demo: "",
};

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState([]); // File[] buat create ATAU tambahan gambar
  const [gambars, setGambars] = useState([]); // gambar yang sudah tersimpan (mode edit)

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [githubProject, setGithubProject] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    projectService.getById(id).then(data => {
      if (ignore) return;
      setGithubProject(data.github_id != null);
      setForm(Object.fromEntries(Object.keys(emptyForm).map(key => [key,
        key.startsWith("tanggal_") ? (data[key]?.split("T")[0] || "") : (data[key] || "")])));
      setGambars(data.gambars || []);
    }).catch(err => { if (!ignore) setError(err.response?.data?.message || "Gagal memuat proyek."); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, ...(!isEdit ? { is_showcase: 1 } : {}) };
    if (!isEdit && newImages.length > 0) {
      payload.gambar = newImages;
    }

    try {
      if (isEdit) {
        await projectService.update(id, payload);
      } else {
        const created = await projectService.create(payload);
        navigate(`/admin/project/${created.id}`);
        return;
      }
      navigate("/admin/project");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menyimpan project.";
      const detail = err.response?.data?.errors
        ? `\n${JSON.stringify(err.response.data.errors)}`
        : "";
      setError(
        `${msg}${detail}${err.response?.status ? ` (${err.response.status})` : ""}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const added = await projectService.addGambar(id, files);
      setGambars((prev) => [...prev, ...added]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menambah gambar.";
      alert(`${msg}${err.response?.status ? ` (${err.response.status})` : ""}`);
    }
  };

  const handleRemoveImage = async (gambarId) => {
    if (!confirm("Hapus gambar ini?")) return;
    try {
      await projectService.removeGambar(gambarId);
      setGambars((prev) => prev.filter((g) => g.id !== gambarId));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menghapus gambar.";
      alert(`${msg}${err.response?.status ? ` (${err.response.status})` : ""}`);
    }
  };

  if (loading) return <p className="text-black/60">Memuat...</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/project" className="inline-block mb-4 text-sm underline">Kembali ke daftar repo</Link>
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Detail proyek" : "Studi kasus baru"}
      </h1>

      {!isEdit && <p className="text-sm text-black/60 mb-5">Untuk proyek dengan kode private, isi penjelasan dan gambar yang boleh dipublikasikan. Tautan GitHub boleh dikosongkan. Setelah disimpan, aktifkan tombol Tampilkan di daftar proyek.</p>}
      {githubProject && <p className="text-sm text-black/60 mb-5">Nama, deskripsi singkat, dan tautan berasal dari GitHub dan diperbarui saat sinkronisasi. Simpan cerita proyek, peran, serta teknologi di Detail & implementasi; bagian ini dan galeri tetap tersimpan saat sinkronisasi.</p>}
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nama"
            name="nama"
            readOnly={githubProject}
            value={form.nama}
            onChange={handleChange}
            required
          />
          <Textarea
            label="Deskripsi"
            name="deskripsi"
            readOnly={githubProject}
            value={form.deskripsi}
            onChange={handleChange}
          />
          <Textarea
            label="Detail & implementasi"
            name="fitur"
            value={form.fitur}
            onChange={handleChange}
          />
          <Input
            label="Tanggal Mulai"
            type="date"
            name="tanggal_mulai"
            value={form.tanggal_mulai}
            onChange={handleChange}
          />
          <Input
            label="Tanggal Selesai"
            type="date"
            name="tanggal_selesai"
            value={form.tanggal_selesai}
            onChange={handleChange}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={["berjalan", "selesai", "arsip"]}
            required
          />
          <Input
            label="Link GitHub"
            name="link_github"
            readOnly={githubProject}
            value={form.link_github}
            onChange={handleChange}
          />
          <Input
            label="Link Demo"
            name="link_demo"
            readOnly={githubProject}
            value={form.link_demo}
            onChange={handleChange}
          />

          {!isEdit && (
            <FileInput
              label="Gambar (bisa lebih dari 1)"
              name="gambar"
              accept="image/*"
              multiple
              onChange={(e) => setNewImages(Array.from(e.target.files))}
            />
          )}

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </Card>

      {isEdit && (
        <Card className="mt-4">
          <h2 className="font-semibold mb-3">Gambar Project</h2>

          {gambars.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {gambars.map((g, idx) => {
                const path = typeof g === "string" ? g : g?.gambar;
                const gambarId = typeof g === "string" ? idx : g?.id;
                if (!path) return null;
                return (
                  <div key={gambarId ?? idx} className="relative">
                    <img
                      src={getStorageUrl(path)}
                      alt=""
                      className="w-full h-24 object-cover border border-black/10"
                    />
                    {gambarId != null && (
                      <button
                        onClick={() => handleRemoveImage(gambarId)}
                        className="absolute top-1 right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <FileInput
            label="Tambah Gambar"
            name="gambar_tambahan"
            accept="image/*"
            multiple
            onChange={handleAddImages}
          />
        </Card>
      )}
    </div>
  );
}
