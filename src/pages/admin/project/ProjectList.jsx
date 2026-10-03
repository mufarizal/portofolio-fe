import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../../../services/projectService";
import { normalizeUrl } from "../../../utils/guest";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";

function message(error) {
  if (error.response?.status === 429) return "Batas akses GitHub tercapai. Tunggu beberapa saat lalu coba lagi.";
  if (error.response?.status === 404) return "Repo belum tersimpan. Klik Sinkronkan GitHub lalu coba lagi.";
  return error.response?.data?.message || error.message || "Gagal memuat proyek. Silakan coba lagi.";
}

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(12);
  const lock = useRef(false);

  useEffect(() => {
    let ignore = false;
    projectService.getGithub().then(data => { if (!ignore) setProjects(data); })
      .catch(err => { if (!ignore) setError(message(err)); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  async function refresh(sync = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(sync ? "sync" : "refresh"); setError(""); setNotice("");
    try {
      if (sync) {
        const counts = await projectService.syncGithub();
        setNotice(`${counts.synced} repo disinkronkan; ${counts.created} repo baru. Repo baru masih disembunyikan sampai Anda menampilkannya.`);
      }
      setProjects(await projectService.getGithub());
    } catch (err) { setError(message(err)); }
    finally { setBusy(null); setLoading(false); lock.current = false; }
  }

  async function toggle(project) {
    if (lock.current) return;
    lock.current = true;
    setBusy(project.manual ? `manual-${project.id}` : project.github_id); setError(""); setNotice("");
    try {
      const saved = await (project.manual ? projectService.setManualVisibility(project.id, !project.is_active) : projectService.setVisibility(project.github_id, !project.is_active));
      const active = [true, 1, "1"].includes(saved.is_active);
      setProjects(prev => prev.map(p => (project.manual ? p.manual && p.id === project.id : p.github_id === project.github_id) ? { ...p, is_active: active } : p));
      setNotice(`${project.nama} ${active ? "ditampilkan di" : "disembunyikan dari"} portofolio.`);
    } catch (err) { setError(message(err)); }
    finally { setBusy(null); lock.current = false; }
  }

  const visible = projects.filter(p => `${p.nama || ""} ${p.deskripsi || ""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (filter === "all" || (filter === "active" ? p.is_active : !p.is_active)));
  return <div className="max-w-6xl mx-auto">
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div><p className="text-xs uppercase tracking-widest text-black/50 mb-2">Konten portofolio</p><h1 className="text-2xl font-semibold">Proyek & studi kasus</h1><p className="text-sm text-black/60 mt-2 max-w-xl">Pilih repo publik atau buat studi kasus untuk proyek dengan kode private. Sinkronkan repo baru sebelum mengelola detail dan galerinya.</p></div>
      <div className="flex flex-col gap-2 shrink-0"><Link to="/admin/project/new" className="border border-black/20 px-4 py-3 text-sm text-center">Tambah studi kasus</Link><Button onClick={() => refresh(true)} disabled={busy !== null || loading} className="shrink-0 min-h-11">{busy === "sync" ? "Menyinkronkan..." : "Sinkronkan GitHub"}</Button></div>
    </header>
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/60 mb-6"><span>{projects.length} proyek</span><span>{projects.filter(p => p.is_active).length} ditampilkan</span><span>{projects.filter(p => !p.is_active).length} disembunyikan</span></div>
    {notice && <p role="status" className="p-4 mb-4 bg-black/5 text-sm">{notice}</p>}
    {error && <div role="alert" className="p-4 mb-4 border border-red-200 text-sm text-red-700"><p>{error}</p><Button variant="outline" onClick={() => refresh()} disabled={busy !== null} className="mt-3">Coba lagi</Button></div>}
    <div className="grid sm:grid-cols-[1fr_200px] gap-3 mb-6">
      <label className="text-sm">Cari repo<input type="search" value={query} onChange={e => {setQuery(e.target.value); setLimit(12);}} placeholder="Nama atau deskripsi repo" className="block w-full border border-black/20 p-3 mt-2" /></label>
      <label className="text-sm">Status tampilan<select value={filter} onChange={e => {setFilter(e.target.value); setLimit(12);}} className="block w-full border border-black/20 p-3 mt-2 bg-white"><option value="all">Semua repo</option><option value="active">Ditampilkan</option><option value="hidden">Disembunyikan</option></select></label>
    </div>
    {loading ? <p role="status" className="py-12 text-black/60">Memuat repo GitHub...</p> : <>
      {!visible.length && !error && <Card><h2 className="font-medium">{projects.length ? "Tidak ada repo yang cocok." : "Belum ada repo publik."}</h2><p className="text-sm text-black/60 mt-2">{projects.length ? "Ubah pencarian atau filter tampilan." : "Pastikan repo GitHub bersifat publik, lalu sinkronkan."}</p></Card>}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{visible.slice(0,limit).map(project => {
        const github = normalizeUrl(project.link_github);
        return <Card key={project.manual ? `manual-${project.id}` : project.github_id} className="flex flex-col min-w-0">
          <div className="flex flex-wrap justify-between gap-2 text-xs mb-4"><span className={project.is_active ? "bg-black text-white px-2 py-1" : "bg-black/5 text-black/60 px-2 py-1"}>{project.is_active ? "Ditampilkan" : "Disembunyikan"}</span>{project.id == null && <span className="py-1 text-black/60">Belum disinkronkan</span>}</div>
          <h2 className="font-semibold break-words">{project.nama}</h2><p className="text-sm text-black/60 mt-2 mb-4 line-clamp-3">{project.deskripsi || "Deskripsi belum diisi."}</p>
          <div className="text-xs text-black/50 flex flex-wrap gap-3 mb-5">{project.manual ? <span>Studi kasus manual</span> : project.bahasa && <span>{project.bahasa}</span>}<span>{project.gambars?.length || 0} gambar</span>{github && <a className="underline underline-offset-4" href={github} target="_blank" rel="noreferrer">Buka GitHub</a>}</div>
          <div className="mt-auto flex flex-col gap-2">
            <button type="button" aria-label={`${project.is_active ? "Sembunyikan" : "Tampilkan"} ${project.nama}`} aria-pressed={project.is_active} disabled={busy !== null || project.id == null} onClick={() => toggle(project)} className="min-h-11 px-3 py-2 bg-black text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed">{busy === (project.manual ? `manual-${project.id}` : project.github_id) ? "Menyimpan..." : project.is_active ? "Sembunyikan dari portofolio" : "Tampilkan di portofolio"}</button>
            {project.id != null ? <Link to={`/admin/project/${project.id}`} className="min-h-11 px-3 py-2 border border-black/20 text-center text-sm flex items-center justify-center">Kelola detail & galeri</Link> : <p className="text-xs text-black/50 text-center py-2">Sinkronkan GitHub untuk mengelola repo ini.</p>}
          </div>
        </Card>;
      })}</div>
      {visible.length > limit && <div className="mt-6 text-center"><Button variant="outline" onClick={() => setLimit(n => n + 12)}>Muat lebih banyak ({visible.length - limit})</Button></div>}
    </>}
  </div>;
}
