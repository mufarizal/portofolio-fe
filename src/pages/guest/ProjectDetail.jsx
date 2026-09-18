import { Link, useLocation, useParams } from "react-router-dom";
import { usePortofolio } from "../../context/portofolioState";
import { featureParagraphs, normalizeUrl, period, projectImages, sortRecent } from "../../utils/guest";
import { EmptyState, PageMeta, Prose, Status } from "../../components/guest/Elements";
import ProjectGallery from "../../components/guest/ProjectGallery";
import Icon from "../../components/guest/Icon";

export default function ProjectDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data } = usePortofolio();
  const projects = sortRecent(data.projects);
  const project = projects.find((item) => String(item.id) === id);
  const origin = location.state?.from;
  const backTo = typeof origin === "string" && (origin === "/" || /^\/projects(?:\?|$)/.test(origin)) ? origin : "/projects";
  if (!project) return <><PageMeta title="Proyek tidak ditemukan — Portofolio" /><EmptyState title="Proyek tidak ditemukan" message="Proyek ini belum tersedia atau sudah tidak ada dalam koleksi."><Link to="/projects" className="button button-primary"><Icon name="left" size={18} />Lihat semua proyek</Link></EmptyState></>;
  const images = projectImages(project);
  const github = normalizeUrl(project.link_github);
  const demo = normalizeUrl(project.link_demo);
  const index = projects.indexOf(project);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const name = project.nama || "Proyek tanpa judul";
  const hasFeatures = typeof project.fitur === "string" && project.fitur.trim();
  return <div className="project-detail">
    <PageMeta title={`${name} — ${data.profile.nama || "Portofolio"}`} description={project.deskripsi} />
    <Link to={backTo} state={{ restore: true }} className="back-link"><Icon name="left" size={18} />Kembali ke proyek</Link>
    <header className="detail-heading"><p className="eyebrow">Studi kasus <span>/ {String(index + 1).padStart(2, "0")}</span></p><h1>{name}</h1><div className="detail-heading-meta"><Status value={project.status} /><span className="mono">{period(project)}</span></div></header>
    <div className="detail-layout"><article className="detail-story">
      <section id="ringkasan" className="detail-section"><div className="detail-section-heading"><span className="mono">01</span><h2>Tentang proyek</h2></div>{project.deskripsi ? <Prose text={project.deskripsi} /> : <p className="muted">Deskripsi proyek belum ditambahkan.</p>}</section>
      {hasFeatures && <section id="fitur" className="detail-section"><div className="detail-section-heading"><span className="mono">02</span><h2>Fitur & implementasi</h2></div><div className="feature-copy">{featureParagraphs(project.fitur).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></section>}
      {images.length > 0 && <section id="dokumentasi" className="detail-section"><div className="detail-section-heading"><span className="mono">{hasFeatures ? "03" : "02"}</span><h2>Dokumentasi</h2></div><ProjectGallery key={project.id} images={images} name={name} /></section>}
    </article><aside className="project-info" aria-label="Informasi proyek"><p className="eyebrow">Informasi proyek</p><dl>{project.status && <div><dt>Status</dt><dd className="capitalize">{project.status}</dd></div>}<div><dt>Periode pengerjaan</dt><dd>{period(project)}</dd></div>{images.length > 0 && <div><dt>Dokumentasi</dt><dd>{images.length} gambar</dd></div>}</dl>{(github || demo) && <div className="project-resource-links">{github && <a href={github} target="_blank" rel="noreferrer" className="button button-primary"><Icon name="github" size={18} />Lihat kode<Icon name="arrow" size={16} /></a>}{demo && <a href={demo} target="_blank" rel="noreferrer" className="button button-secondary">Buka demo<Icon name="arrow" size={16} /></a>}</div>}<nav className="project-toc" aria-label="Daftar isi proyek"><span className="control-label">Di halaman ini</span><a href="#ringkasan">Tentang proyek<Icon name="down" size={14} /></a>{hasFeatures && <a href="#fitur">Fitur & implementasi<Icon name="down" size={14} /></a>}{images.length > 0 && <a href="#dokumentasi">Dokumentasi<Icon name="down" size={14} /></a>}</nav></aside></div>
    <div className="project-ending">{next ? <Link to={`/project/${next.id}`} state={{ from: backTo }} className="next-project"><span className="eyebrow">Proyek berikutnya</span><span className="next-project-title">{next.nama}<Icon name="arrow" size={28} /></span></Link> : <Link to="/projects" className="text-link">Lihat koleksi proyek<Icon name="right" size={18} /></Link>}<Link to="/#contact" className="text-link detail-contact">Diskusikan proyek Anda<Icon name="arrow" size={18} /></Link></div>
  </div>;
}
