import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sertifikatService } from "../../../services/sertifikatService";
import Input from "../../../components/common/Input";
import FileInput from "../../../components/common/FileInput";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";

const emptyForm = {
  nama_sertifikat: "",
  lembaga_penerbit: "",
  tanggal_terbit: "",
  tanggal_kadaluarsa: "",
};

export default function SertifikatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    sertifikatService.getById(id).then(data => {
      if (ignore) return;
      setForm({
        nama_sertifikat: data.nama_sertifikat || "",
        lembaga_penerbit: data.lembaga_penerbit || "",
        tanggal_terbit: data.tanggal_terbit?.slice(0, 10) || "",
        tanggal_kadaluarsa: data.tanggal_kadaluarsa?.slice(0, 10) || "",
      });
      setCurrentFile(data.file_sertifikat);
    }).catch(() => { if (!ignore) setError("Gagal memuat data. Muat ulang sebelum mengedit."); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file && (file.size > 2 * 1024 * 1024 || !["application/pdf", "image/png", "image/jpeg"].includes(file.type))) {
      setError("Gunakan PDF, PNG, atau JPG dengan ukuran maksimal 2 MB.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = { ...form };
    if (file) payload.file_sertifikat = file;

    try {
      if (isEdit) {
        await sertifikatService.update(id, payload);
      } else {
        await sertifikatService.create(payload);
      }
      navigate("/admin/sertifikat");
    } catch (err) {
      setError(Object.values(err.response?.data?.errors || {}).flat().join(" ") || (err.response?.status === 413 ? "File terlalu besar. Maksimal 2 MB." : "Gagal menyimpan sertifikat. Periksa isian dan koneksi, lalu coba lagi."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-black/60">Memuat...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit Sertifikat" : "Tambah Sertifikat"}
      </h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nama Sertifikat"
            name="nama_sertifikat"
            value={form.nama_sertifikat}
            onChange={handleChange}
            required
          />
          <Input
            label="Lembaga Penerbit"
            name="lembaga_penerbit"
            value={form.lembaga_penerbit}
            onChange={handleChange}
            required
          />
          <Input
            label="Tanggal Terbit"
            type="date"
            name="tanggal_terbit"
            value={form.tanggal_terbit}
            onChange={handleChange}
            required
          />
          <Input
            label="Tanggal Kadaluarsa (opsional)"
            type="date"
            name="tanggal_kadaluarsa"
            value={form.tanggal_kadaluarsa}
            onChange={handleChange}
          />
          <FileInput
            label="File Sertifikat (PDF/gambar)"
            name="file_sertifikat"
            accept=".pdf,.png,.jpg,.jpeg"
            currentFile={currentFile}
            onChange={(e) => setFile(e.target.files[0])}
          />

          <p className="text-xs text-black/60 mb-4">PDF, PNG, atau JPG, maksimal 2 MB. Kosongkan tanggal kedaluwarsa jika berlaku tanpa batas. File lama tetap tersimpan jika tidak diganti.</p>

          {error && <p role="alert" className="text-sm text-red-500 mb-4">{error}</p>}

          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
