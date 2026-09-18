const text = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizeUrl(value) {
  const input = text(value);
  if (!input || /^(?!https?:)[a-z][a-z\d+.-]*:/i.test(input)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input.replace(/^\/\//, "")}`);
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".") ? url.href : null;
  } catch { return null; }
}

export function storageUrl(value, base = import.meta.env?.VITE_API_STORAGE_URL) {
  const input = text(value);
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) return normalizeUrl(input);
  if (!base || /^[a-z][a-z\d+.-]*:/i.test(input) || input.startsWith("//")) return null;
  return `${base.replace(/\/+$/, "")}/${input.replace(/^\/?storage\//, "").replace(/^\/+/, "")}`;
}

export function socialLinks(profile = {}) {
  const instagram = text(profile.instagram);
  return [
    { label: "GitHub", icon: "github", href: normalizeUrl(profile.github) },
    { label: "LinkedIn", icon: "linkedin", href: normalizeUrl(profile.linkedin) },
    { label: "Instagram", icon: "instagram", href: instagram ? normalizeUrl(/instagram\.com\//i.test(instagram) ? instagram : `https://www.instagram.com/${instagram.replace(/^@/, "")}`) : null },
  ].filter((link) => link.href);
}

export function normalizeProse(value) {
  return text(value).replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n\n");
}

export function excerpt(value, max = 180) {
  const content = normalizeProse(value).replace(/\n/g, " ");
  if (content.length <= max) return content;
  const shortened = content.slice(0, max);
  const boundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, boundary > max * 0.6 ? boundary : max).trimEnd()}…`;
}

export function initials(name) {
  const words = text(name).split(/\s+/).filter(Boolean);
  return words.length ? `${words[0][0]}${words.length > 1 ? words.at(-1)[0] : ""}`.toUpperCase() : "P";
}

export function dateValue(value) {
  const timestamp = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function displayDate(value, full = false) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { ...(full ? { day: "numeric" } : {}), month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function period(item) {
  const start = displayDate(item.tanggal_mulai);
  const end = displayDate(item.tanggal_selesai);
  const active = ["aktif", "berlangsung", "dalam pengerjaan", "ongoing"].includes(text(item.status).toLowerCase());
  if (start && end) return `${start} — ${end}`;
  if (start) return `${start} — ${active ? "Sekarang" : "Belum dicantumkan"}`;
  if (end) return `Sampai ${end}`;
  return "Periode belum dicantumkan";
}

export function sortRecent(items, field = "tanggal_mulai") {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => dateValue(b[field]) - dateValue(a[field]) || String(a.id).localeCompare(String(b.id), "id", { numeric: true }));
}

export function projectImages(project) {
  return [...(Array.isArray(project?.gambars) ? project.gambars : [])].filter((image) => storageUrl(image.gambar)).sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0));
}

export function normalizePortfolio(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Respons portofolio tidak valid.");
  const result = { profile: payload.profile && typeof payload.profile === "object" ? payload.profile : {} };
  for (const key of ["projects", "skills", "karirs", "pendidikans", "sertifikats"]) {
    result[key] = Array.isArray(payload[key]) ? payload[key].filter((item) => item && typeof item === "object") : [];
  }
  return result;
}

export function filterCollection(items, { query = "", filter = "", sort = "newest", certificate = false } = {}) {
  const fields = certificate ? ["nama_sertifikat", "lembaga_penerbit"] : ["nama", "deskripsi", "fitur"];
  const field = certificate ? "lembaga_penerbit" : "status";
  const search = query.trim().toLocaleLowerCase("id-ID");
  const result = items.filter((item) => (!filter || text(item[field]) === filter) && fields.some((key) => text(item[key]).toLocaleLowerCase("id-ID").includes(search)));
  const sorted = sortRecent(result, certificate ? "tanggal_terbit" : "tanggal_mulai");
  return sort === "oldest" ? sorted.reverse() : sorted;
}

export function paginate(items, requestedPage, size = 6) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const requested = Number(requestedPage);
  const page = Math.min(totalPages, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 1));
  return { page, totalPages, items: items.slice((page - 1) * size, page * size) };
}

// Keep the author's feature boundaries, but join wrapped lowercase continuations.
// Plain text remains paragraphs; it is not presented as a structured API array.
export function featureParagraphs(value) {
  const lines = text(value).replace(/\r\n?/g, "\n").split("\n");
  const paragraphs = [];
  let separated = true;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { separated = true; continue; }
    if (!separated && /^[a-z]/.test(line) && paragraphs.length) paragraphs[paragraphs.length - 1] += ` ${line}`;
    else paragraphs.push(line);
    separated = false;
  }
  return paragraphs;
}
