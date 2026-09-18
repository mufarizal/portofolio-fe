import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePortofolio } from "../../context/portofolioState";
import { guestIdentity } from "../../config/guest";
import { normalizeProse, socialLinks, sortRecent, storageUrl } from "../../utils/guest";
import { CertificateRow, Disclosure, MediaImage, PageMeta, ProjectCard, Prose, SectionHeading, Timeline } from "../../components/guest/Elements";
import Icon from "../../components/guest/Icon";

const skillGroups = [
  { title: "Backend & data", icon: "database", names: ["php", "laravel", "rest api", "mysql", "postgresql", "redis", "node.js", "python", "mongodb", "mqtt"] },
  { title: "Antarmuka web", icon: "code", names: ["html", "css", "javascript", "typescript", "react", "vue", "tailwind css"] },
  { title: "Tools & platform", icon: "tools", names: ["git", "github", "wordpress", "docker", "linux", "postman"] },
];

function Skills({ skills }) {
  const known = new Set(skillGroups.flatMap((group) => group.names));
  const groups = [...skillGroups.map((group) => ({ ...group, items: skills.filter((skill) => group.names.includes(skill.nama?.toLowerCase().trim())) })), { title: "Keahlian lainnya", icon: "code", items: skills.filter((skill) => !known.has(skill.nama?.toLowerCase().trim())) }].filter((group) => group.items.length);
  return <div className="skill-groups">{groups.map((group) => <div className="skill-group" key={group.title}><Icon name={group.icon} size={24} /><h3>{group.title}</h3><ul>{group.items.map((skill) => <li key={skill.id}>{storageUrl(skill.icon) && <MediaImage src={storageUrl(skill.icon)} alt="" className="skill-icon" loading="lazy" width="18" height="18" fallback={<Icon name="code" size={16} />} />}<span>{skill.nama}</span></li>)}</ul></div>)}</div>;
}

function Contact({ profile }) {
  const [copyState, setCopyState] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopyState("Alamat email disalin."); }
    catch { setCopyState("Pilih alamat email untuk menyalinnya secara manual."); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState(""), 5000);
  };
  return <section className="guest-section contact-section" id="contact"><p className="eyebrow"><span>06</span> / Kontak</p><h2>Diskusikan<br />proyek Anda.</h2><p className="contact-intro">Untuk pengembangan web, integrasi sistem, atau peluang kolaborasi, hubungi saya melalui email.</p>{profile.email && <div className="contact-email-row"><a href={`mailto:${profile.email}`} className="contact-email">{profile.email}<Icon name="arrow" size={26} /></a><button className="icon-button copy-button" aria-label="Salin alamat email" onClick={copy}><Icon name={copyState.startsWith("Alamat") ? "check" : "copy"} /></button></div>}<p className="copy-feedback" role="status">{copyState}</p><div className="contact-socials">{socialLinks(profile).map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="text-link"><Icon name={link.icon} size={18} />{link.label}<Icon name="arrow" size={15} /></a>)}</div></section>;
}

export default function Home() {
  const { data } = usePortofolio();
  const { profile, projects, skills, karirs, pendidikans, sertifikats } = data;
  const description = normalizeProse(profile.deskripsi);
  const firstSentence = description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || description;
  const rest = description.slice(firstSentence.length).trim();
  const recentProjects = sortRecent(projects);
  const certificates = sortRecent(sertifikats, "tanggal_terbit");
  return <>
    <PageMeta title={`${profile.nama || "Portofolio"} — ${guestIdentity.focus}`} description={description} />
    <section id="home" className="hero-section"><div className="hero-topline"><p className="eyebrow">{guestIdentity.focus}</p><span className="mono hero-discipline">{guestIdentity.discipline}</span></div><h1>{profile.nama || "Portofolio pengembangan web"}<span className="hero-period" aria-hidden="true">.</span></h1>{firstSentence && <p className="hero-description">{firstSentence}</p>}{rest && <Disclosure label="Lebih tentang saya" className="hero-about"><Prose text={rest} /></Disclosure>}<div className="hero-actions"><Link className="button button-primary" to="/#projects">Lihat proyek<Icon name="right" size={18} /></Link>{storageUrl(profile.cv) && <a className="button button-secondary" href={storageUrl(profile.cv)} target="_blank" rel="noreferrer"><Icon name="document" size={18} />Lihat CV<Icon name="arrow" size={16} /></a>}</div><div className="hero-foot"><span>{profile.profesi || guestIdentity.discipline}</span><Link to="/#projects" className="text-link">Jelajahi portofolio<Icon name="down" size={16} /></Link></div></section>
    <section id="projects" className="guest-section"><SectionHeading number="01" title="Proyek" description="Proyek yang saya kerjakan.">{projects.length > 0 && <Link to="/projects" className="text-link">Semua proyek <span className="count">{projects.length}</span><Icon name="arrow" size={18} /></Link>}</SectionHeading>{projects.length ? <div className="project-grid">{recentProjects.slice(0, 4).map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div> : <p className="section-empty">Proyek akan ditampilkan di sini setelah ditambahkan.</p>}</section>
    <section id="skills" className="guest-section"><SectionHeading number="02" title="Keahlian" description="Teknologi yang saya gunakan." />{skills.length ? <Skills skills={skills} /> : <p className="section-empty">Keahlian belum ditambahkan.</p>}</section>
    <section id="karir" className="guest-section"><SectionHeading number="03" title="Pengalaman" description="Pengalaman profesional." /><Timeline items={karirs} /></section>
    <section id="pendidikan" className="guest-section"><SectionHeading number="04" title="Pendidikan" description="Perjalanan pendidikan." /><Timeline items={pendidikans} education /></section>
    <section id="sertifikat" className="guest-section"><SectionHeading number="05" title="Sertifikat" description="Pembelajaran & sertifikasi.">{sertifikats.length > 0 && <Link to="/sertifikat" className="text-link">Semua sertifikat <span className="count">{sertifikats.length}</span><Icon name="arrow" size={18} /></Link>}</SectionHeading>{certificates.length ? <div className="certificate-list">{certificates.slice(0, 6).map((certificate) => <CertificateRow key={certificate.id} certificate={certificate} />)}</div> : <p className="section-empty">Sertifikat belum ditambahkan.</p>}</section>
    <Contact profile={profile} />
  </>;
}
