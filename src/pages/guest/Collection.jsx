import { Link, useSearchParams } from "react-router-dom";
import { usePortofolio } from "../../context/portofolioState";
import { filterCollection, paginate } from "../../utils/guest";
import { CertificateRow, EmptyState, PageMeta, Pagination, ProjectCard } from "../../components/guest/Elements";
import { scrollBehavior } from "../../utils/motion";
import Icon from "../../components/guest/Icon";

export default function Collection({ certificate = false }) {
  const { data } = usePortofolio();
  const [params, setParams] = useSearchParams();
  const items = certificate ? data.sertifikats : data.projects;
  const title = certificate ? "Sertifikat" : "Proyek";
  const query = params.get("q") || "";
  const filter = params.get("filter") || "";
  const sort = params.get("sort") === "oldest" ? "oldest" : "newest";
  const filterField = certificate ? "lembaga_penerbit" : "status";
  const options = [...new Set(items.map((item) => item[filterField]?.trim()).filter(Boolean))].sort();
  const filtered = filterCollection(items, { query, filter, sort, certificate });
  const result = paginate(filtered, params.get("page"), 6);
  const update = (field, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "newest" && !(field === "page" && value === "1")) next.set(field, value); else next.delete(field);
    if (field !== "page") next.delete("page");
    setParams(next, { replace: field !== "page" });
    if (field === "page") requestAnimationFrame(() => document.getElementById("collection-results")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" }));
  };
  const clear = () => setParams(new URLSearchParams(), { replace: true });
  return <div className="collection-page">
    <PageMeta title={`${title} — ${data.profile.nama || "Portofolio"}`} description={certificate ? "Sertifikat dan pembelajaran profesional." : "Proyek pengembangan web beserta konteks, fitur, dan dokumentasinya."} />
    <Link to={`/#${certificate ? "sertifikat" : "projects"}`} className="back-link"><Icon name="left" size={18} />Kembali ke beranda</Link>
    <header className="page-heading"><p className="eyebrow">Arsip / {title}</p><h1>{certificate ? "Sertifikat & pembelajaran" : "Seluruh proyek"}<span className="heading-count">{String(items.length).padStart(2, "0")}</span></h1><p>{certificate ? "Catatan pembelajaran, kompetensi, dan dokumen sertifikasi." : "Kumpulan sistem dan aplikasi web yang saya kerjakan. Buka setiap proyek untuk melihat detailnya."}</p></header>
    {items.length > 0 && <form className="collection-toolbar" role="search" onSubmit={(event) => event.preventDefault()}><label className="search-field"><span className="control-label">Cari {title.toLowerCase()}</span><span className="input-wrap"><Icon name="search" size={18} /><input type="search" value={query} onChange={(event) => update("q", event.target.value)} placeholder={certificate ? "Nama atau lembaga penerbit…" : "Nama atau deskripsi proyek…"} /></span></label>{(options.length > 1 || filter) && <label><span className="control-label">{certificate ? "Penerbit" : "Status"}</span><select value={filter} onChange={(event) => update("filter", event.target.value)}><option value="">{certificate ? "Semua penerbit" : "Semua status"}</option>{filter && !options.includes(filter) && <option value={filter}>{filter}</option>}{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>}<label><span className="control-label">Urutan</span><select value={sort} onChange={(event) => update("sort", event.target.value)}><option value="newest">Terbaru dahulu</option><option value="oldest">Terlama dahulu</option></select></label></form>}
    <div id="collection-results" className="collection-results"><div className="results-summary"><p role="status">{filtered.length ? `${(result.page - 1) * 6 + 1}–${Math.min(result.page * 6, filtered.length)} dari ${filtered.length} ${title.toLowerCase()}` : `0 ${title.toLowerCase()}`}</p>{(query || filter) && <button className="text-link" onClick={clear}>Reset pencarian<Icon name="close" size={15} /></button>}</div>
    {filtered.length ? certificate ? <div className="certificate-list">{result.items.map((item) => <CertificateRow key={item.id} certificate={item} />)}</div> : <div className="project-grid">{result.items.map((item, index) => <ProjectCard key={item.id} project={item} index={(result.page - 1) * 6 + index} />)}</div> : <EmptyState title={items.length ? "Tidak ada hasil yang cocok" : `${title} belum ditambahkan`} message={items.length ? "Coba kata kunci lain atau hapus filter untuk melihat seluruh koleksi." : "Koleksi akan muncul di halaman ini setelah tersedia."}>{items.length > 0 && <button className="button button-secondary" onClick={clear}>Tampilkan semua</button>}</EmptyState>}
    <Pagination page={result.page} totalPages={result.totalPages} onChange={(page) => update("page", String(page))} /></div>
  </div>;
}
