# Handoff frontend guest: project publik GitHub

Diperbarui: 23 September 2026. Pemeriksaan awal: 22 September 2026.

## Implementasi

- Profil, keahlian, pengalaman, pendidikan, dan sertifikat tetap memakai `GET /api/portofolio`.
- Beranda, arsip `/projects`, dan detail `/project/:id` memakai `GET /api/projects/public`. ID route tetap ID lokal, bukan `github_id`.
- Kedua request berjalan independen. Error project tidak menutup section lain. Retry hanya mengulang request project. Request dibatalkan saat provider dilepas atau request baru dimulai.
- `projects` dari endpoint lama sengaja diabaikan: fallback ke sana dapat menampilkan repository yang dinonaktifkan.
- Hanya record dengan `is_active` bernilai true/1/"1" dan `github_id` tidak null yang digunakan. Urutan awal mengikuti `sort_order` ascending; nilai sama mempertahankan urutan API.
- Arsip menyediakan pencarian, urutan pilihan utama/nama A–Z, dan pagination 6 item. Beranda menampilkan 4 project pertama. Pencarian dan halaman tersimpan dalam URL serta dipertahankan ketika kembali dari detail.
- Kartu tanpa gambar memakai layout teks. Field periode, status, fitur dan galeri hanya ditampilkan jika tersedia; tidak ada tanggal, bahasa, atau statistik GitHub yang dikarang.
- `gambars` tetap digunakan untuk screenshot dan galeri. Tautan kode dan demo hanya dirender jika valid.
- Skeleton, data kosong, error, HTTP 429 dan retry tersedia. Pesan error backend mentah tidak ditampilkan kepada pengunjung.
- Smooth scroll, transisi React, focus keyboard, reduced-motion, serta layout mobile tetap dipertahankan. Anchor detail menunggu request project selesai sebelum menentukan posisi scroll.
- Halaman admin dan backend tidak diubah. Tidak ada GitHub token pada frontend.

## Status integrasi server — 23 September 2026

Pembacaan langsung `GET https://api.mufarizal.my.id/api/projects/public` sudah menghasilkan HTTP 200. Saat pemeriksaan, response berisi satu project aktif: `BookingRooms`, ID lokal `16`, GitHub ID `748468156`, `sort_order: 0`, dengan deskripsi/demo null dan `gambars: []`. Ringkasan backend menyatakan semua repo masih nonaktif, tetapi respons terbaru menunjukkan satu repo sudah diaktifkan. Tidak ada perubahan visibility dilakukan dari frontend dalam pemeriksaan ini.

Kendala sebelumnya (HTTP 500 karena kolom `is_active` tidak ditemukan) sudah tidak muncul pada pemeriksaan terbaru.

## Kontrak backend terbaru

- Backend public memfilter `is_active = true` dan `github_id IS NOT NULL`; frontend juga memfilter keduanya.
- Sync menulis `nama`, `deskripsi`, `link_github`, `link_demo`, dan `github_synced_at`. Untuk repo yang sudah ada, `is_active` dan `sort_order` dipertahankan. Repo baru default nonaktif.
- Kolom metadata tersebut dan relasi `gambars` tetap dipakai. `/api/portofolio` tetap dibutuhkan untuk section non-project.
- `bahasa`, `bintang`, `fork`, dan `diperbarui_pada` belum menjadi kontrak public; guest tidak menampilkannya.
- GitHub token dan kredensial admin tidak boleh ditanamkan dalam source/build frontend. Halaman admin tetap memakai token sesi hasil login untuk request `auth:sanctum` sesuai mekanisme autentikasi aplikasi.
- Endpoint pengubahan `sort_order` belum disebutkan dalam kontrak. Frontend public membaca nilainya, tanpa mengirim perubahan urutan.

## Verifikasi sebelumnya — 22 September 2026

- `npm run test:guest`: 10 tes lulus. Tiga tes kontrak baru terlebih dahulu gagal sebelum implementasi, lalu lulus setelah migrasi.
- `npm run lint:guest`: lulus.
- `npm run build`: lulus.
- `npm run lint`: belum lulus karena error yang sudah ada di admin/common/AuthContext dan duplikatnya pada `.kilo/worktrees/fan-tarp`: 26 error, 10 warning. Area tersebut tidak diedit.
- Browser nyata: profil dan section non-project tetap terbaca ketika endpoint project production gagal.
- Simulasi lokal terpisah: 25 project, 19 sertifikat, 8 pengalaman, 5 pendidikan; field nullable, nama repository panjang, pencarian, reset, pagination, kembali ke URL arsip, filter penerbit, data kosong, HTTP 429 + retry, serta response invalid + retry.
- Detail diuji pada lebar 320, 390, 640, 768, 1024, 1440; arsip project 320–1024; arsip sertifikat 320. Tidak teramati overflow horizontal.
- Galeri: perpindahan gambar, Escape, pemulihan fokus dan pelepasan scroll lock.
- Fixture hanya dipakai di server QA localhost, tidak dimasukkan ke build atau backend. Beberapa file gambar legacy pada fixture tidak dapat dimuat; fallback gambar tampil.

## Urutan validasi deployment

1. Endpoint public sudah terverifikasi 200; konfirmasi daftar aktif sesuai pilihan admin sebelum deployment.
2. Periksa metadata yang tersedia, visibility, dan urutan repository. Deskripsi/demo/gambar kosong tetap didukung.
3. Jalankan frontend dan cek beranda, arsip, direct link detail, serta tautan kode/demo dengan data nyata.
4. Baru deploy frontend setelah pemeriksaan tersebut. Tidak ada deployment dilakukan dalam perubahan ini.

## Verifikasi lanjutan — 23 September 2026

- `npm run test:guest`: 11 tes lulus, termasuk penolakan record aktif tanpa GitHub ID.
- `npm run test:routes`: 2 tes lulus untuk login admin dan redirect root admin dengan auth guard.
- `npm run lint:guest` dan `npm run build`: lulus.
- Browser frontend lokal dengan API produksi: BookingRooms tampil di beranda dan `/project/16`; tautan kode menuju repository yang benar; deskripsi kosong ditangani dan galeri kosong tidak ditampilkan.
- Build frontend belum dideploy ke domain dalam pekerjaan ini. Pemulihan backend tidak otomatis menerbitkan perbaikan route login atau frontend baru.
