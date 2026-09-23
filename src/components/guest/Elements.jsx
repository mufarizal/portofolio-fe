import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  displayDate,
  excerpt,
  initials,
  normalizeProse,
  period,
  projectImages,
  sortRecent,
  storageUrl,
} from "../../utils/guest";
import Icon from "./Icon";

export function Disclosure({ label, className = "", children }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <div className={`text-disclosure ${className}`}>
      <button className="disclosure-trigger" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)}>
        {label}<Icon name="down" size={16} />
      </button>
      <div id={id} className={`disclosure-body ${expanded ? "is-open" : ""}`} aria-hidden={!expanded} inert={!expanded}>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function PageMeta({ title, description }) {
  useEffect(() => {
    const original = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.content;
    document.title = title;
    if (meta && description) meta.content = excerpt(description, 160);
    return () => {
      document.title = original;
      if (meta) meta.content = previous;
    };
  }, [title, description]);
  return null;
}

export function MediaImage({ src, alt, className = "", fallback, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src)
    return (
      <span
        className={`media-fallback ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallback || (
          <>
            <Icon name="image" size={28} />
            <span>Gambar belum tersedia</span>
          </>
        )}
      </span>
    );
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}

export function Avatar({ profile, className = "" }) {
  return (
    <MediaImage
      className={`avatar ${className}`}
      src={storageUrl(profile?.foto)}
      alt={profile?.nama || "Foto profil"}
      width="80"
      height="80"
      fallback={initials(profile?.nama)}
    />
  );
}

export function SectionHeading({ number, title, description, children }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{number}</span> / {title}
        </p>
        <h2>{description}</h2>
      </div>
      {children}
    </div>
  );
}

export function Prose({ text, className = "" }) {
  return (
    <div className={`prose ${className}`}>
      {normalizeProse(text)
        .split("\n\n")
        .filter(Boolean)
        .map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
    </div>
  );
}

export function Status({ value }) {
  return value ? (
    <span className="status">
      <span aria-hidden="true" />
      {value}
    </span>
  ) : null;
}

export function EmptyState({ title, message, children }) {
  return (
    <div className="empty-state">
      <Icon name="document" size={28} />
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}

export function ProjectCard({ project, index = 0 }) {
  const location = useLocation();
  const cover = projectImages(project)[0];
  const name = project.nama || "Proyek tanpa judul";
  return (
    <article className={`project-card ${!cover ? "project-card-text" : ""}`}>
      <Link
        to={`/project/${project.id}`}
        state={{ from: `${location.pathname}${location.search}` }}
        className="project-card-link"
        aria-labelledby={`project-title-${project.id}`}
      >
        {cover && (
          <div className="project-cover">
            <MediaImage
              src={storageUrl(cover.gambar)}
              alt={`Tampilan ${name}`}
              loading="lazy"
              decoding="async"
              width="960"
              height="600"
            />
            <span className="project-cover-action">
              <Icon name="arrow" />
            </span>
          </div>
        )}
        <div className="project-card-body">
          <div className="project-meta">
            <span className="mono">
              {String(index + 1).padStart(2, "0")} /{" "}
              {project.github_id ? "Repository" : displayDate(project.tanggal_mulai) || "Proyek"}
            </span>
            <Status value={project.status} />
          </div>
          <h3 id={`project-title-${project.id}`}>{name}</h3>
          {project.deskripsi && <p>{excerpt(project.deskripsi, 165)}</p>}
          <span className="project-card-cta">
            Lihat detail proyek <Icon name="right" size={18} />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function CertificateRow({ certificate }) {
  const url = storageUrl(certificate.file_sertifikat);
  const issued = displayDate(certificate.tanggal_terbit, true);
  const expires = displayDate(certificate.tanggal_kadaluarsa, true);
  return (
    <article className="certificate-row">
      <span className="certificate-symbol">
        <Icon name="document" size={24} />
      </span>
      <div className="certificate-content">
        <h3>{certificate.nama_sertifikat || "Sertifikat"}</h3>
        <p>{certificate.lembaga_penerbit || "Penerbit belum dicantumkan"}</p>
        <div className="certificate-dates">
          {issued && <span>Terbit {issued}</span>}
          <span>
            {expires
              ? `Masa berlaku hingga ${expires}`
              : "Masa berlaku tidak dicantumkan"}
          </span>
        </div>
      </div>
      {url ? (
        <a
          className="text-link certificate-link"
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Buka dokumen ${certificate.nama_sertifikat || "sertifikat"} (tab baru)`}
        >
          Buka dokumen <Icon name="arrow" size={18} />
        </a>
      ) : (
        <span className="muted certificate-link">Dokumen belum tersedia</span>
      )}
    </article>
  );
}

export function Timeline({ items, education = false }) {
  const initial = education ? 2 : 3;
  const [visible, setVisible] = useState(initial);
  const sorted = sortRecent(items);
  const noun = education ? "pendidikan" : "pengalaman";
  if (!items.length)
    return <p className="section-empty">Riwayat {noun} belum ditambahkan.</p>;
  return (
    <>
      <ol className="timeline" id={`timeline-${noun}`}>
        {sorted.slice(0, visible).map((item) => {
          const description = normalizeProse(item.deskripsi);
          const hasDescription =
            description && description.toLowerCase() !== "deskripsi";
          return (
            <li key={item.id}>
              <div className="timeline-date">
                <span>{period(item)}</span>
                <Status value={item.status} />
              </div>
              <div className="timeline-content">
                <h3>{education ? item.nama : item.jabatan}</h3>
                <p className="timeline-subtitle">
                  {education
                    ? [item.jenjang, item.jurusan].filter(Boolean).join(" · ")
                    : item.perusahaan}
                </p>
                {hasDescription &&
                  (description.length > 240 ? (
                    <Disclosure label="Kontribusi dan detail">
                      <Prose text={description} />
                    </Disclosure>
                  ) : (
                    <Prose text={description} />
                  ))}
              </div>
            </li>
          );
        })}
      </ol>
      {sorted.length > initial && (
        <button
          className="button button-secondary collection-more"
          aria-controls={`timeline-${noun}`}
          aria-expanded={visible > initial}
          onClick={() =>
            setVisible(visible >= sorted.length ? initial : visible + 3)
          }
        >
          {visible >= sorted.length
            ? "Tampilkan lebih sedikit"
            : `Lihat ${Math.min(3, sorted.length - visible)} ${noun} lainnya`}
          <Icon name="down" size={16} />
        </button>
      )}
    </>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Navigasi halaman hasil">
      <button
        className="button button-secondary"
        aria-label="Halaman sebelumnya"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <Icon name="left" size={18} />
        <span>Sebelumnya</span>
      </button>
      <span className="mono" aria-live="polite">
        {page} / {totalPages}
      </span>
      <button
        className="button button-secondary"
        aria-label="Halaman berikutnya"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span>Berikutnya</span>
        <Icon name="right" size={18} />
      </button>
    </nav>
  );
}
