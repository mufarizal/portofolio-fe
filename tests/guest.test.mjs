import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl, storageUrl, socialLinks, normalizePortfolio, filterCollection, paginate, period, featureParagraphs } from "../src/utils/guest.js";

test("professional links accept complete URLs without duplicating their protocol", () => {
  const links = socialLinks({ github: "https://github.com/mufarizal", linkedin: "www.linkedin.com/in/example", instagram: "@example" });
  assert.equal(links[0].href, "https://github.com/mufarizal");
  assert.equal(links[1].href, "https://www.linkedin.com/in/example");
  assert.equal(links[2].href, "https://www.instagram.com/example");
  for (const value of ["javascript:alert(1)", "data:text/html,x", "mailto:a@example.com", null, ""]) assert.equal(normalizeUrl(value), null);
});
test("storage handles prefixed files and external assets without changing their host", () => {
  assert.equal(storageUrl("/storage/project/photo.png", "https://api.example.com/storage/"), "https://api.example.com/storage/project/photo.png");
  assert.equal(storageUrl("https://cdn.example.com/photo.png", "https://api.example.com/storage"), "https://cdn.example.com/photo.png");
  assert.equal(storageUrl(null), null);
});
test("null collections do not crash guest layouts", () => {
  const data = normalizePortfolio({ profile: null, projects: null, karirs: [null, { id: 1 }] });
  assert.deepEqual(data.profile, {});
  assert.deepEqual(data.projects, []);
  assert.equal(data.karirs.length, 1);
  assert.throws(() => normalizePortfolio(null));
});
test("large project archives combine search, status, sorting and safe pagination", () => {
  const projects = Array.from({ length: 57 }, (_, i) => ({ id: i, nama: `Project ${i}`, deskripsi: i % 2 ? "REST API" : "Penggajian", status: i % 3 ? "selesai" : "berlangsung", tanggal_mulai: `2026-01-${String(i % 28 + 1).padStart(2, "0")}` }));
  const filtered = filterCollection(projects, { query: "rest api", filter: "selesai" });
  assert.ok(filtered.length > 6);
  assert.ok(filtered.every(p => p.deskripsi === "REST API" && p.status === "selesai"));
  const page = paginate(filtered, 999);
  assert.equal(page.page, page.totalPages);
  assert.ok(page.items.length > 0 && page.items.length <= 6);
  assert.equal(paginate(projects, "invalid").page, 1);
  assert.equal(paginate(projects, -2).page, 1);
  assert.deepEqual(paginate([], 5).items, []);
  assert.deepEqual(filterCollection(projects, { query: "unmatched" }), []);
});
test("certificate search uses its actual endpoint fields", () => {
  const items = [{ id: 1, nama_sertifikat: "Junior Web Developer", lembaga_penerbit: "LSP", tanggal_terbit: "2026-06-01" }, { id: 2, nama_sertifikat: "Database", lembaga_penerbit: "Other", tanggal_terbit: "2026-01-01" }];
  assert.deepEqual(filterCollection(items, { certificate: true, query: "web", filter: "LSP" }).map(x => x.id), [1]);
});
test("period never turns an inactive record into a current job", () => {
  assert.ok(period({ tanggal_mulai: "2025-01-01", tanggal_selesai: null, status: "aktif" }).endsWith("Sekarang"));
  assert.ok(!period({ tanggal_mulai: "2025-01-01", tanggal_selesai: null, status: "tidak aktif" }).includes("Sekarang"));
  assert.equal(period({}), "Periode belum dicantumkan");
});
test("feature prose rejoins wrapped words while preserving separate statements", () => {
  assert.deepEqual(featureParagraphs("Perhitungan pada service dan\r\ndatabase\r\nNotifikasi risiko\r\n\r\nabsensi harian"), ["Perhitungan pada service dan database", "Notifikasi risiko", "absensi harian"]);
});
