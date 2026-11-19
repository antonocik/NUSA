# NUSA — Studio Arsitektur & Interior

Situs profil perusahaan fiktif-but-realistis untuk NUSA, studio arsitektur dan interior
di Menteng, Jakarta. Seluruh isi, gambar, dan kode ditulis dari nol; tidak ada stok foto,
lorem ipsum, atau nama placeholder.

**Konsep:** arsitektur dimulai dari satu garis, lalu menjadi tempat orang pulang.

## Menjalankan

Tidak ada build step dan tidak ada dependensi.

```bash
cd nusa-studio
python3 -m http.server 4173
# buka http://127.0.0.1:4173/
```

Membuka `index.html` langsung dari disk juga sebagian besar berfungsi, tetapi server lokal
disarankan agar path, font, dan tautan konsisten.

## Struktur

```
nusa-studio/
├── index.html                 Beranda: hero, karya, potongan A–A, proses, catatan
├── studio.html                Profil, tim, prinsip, linimasa, penghargaan, karier
├── projects.html              Indeks karya dengan filter + arsip
├── contact.html               Formulir, informasi studio, peta, jam buka
├── 404.html                   Halaman galat
├── projects/                  Enam studi kasus
│   ├── rumah-tumbuh.html
│   ├── menara-kayu.html
│   ├── pasar-lama.html
│   ├── galeri-candi.html
│   ├── kolam-utara.html
│   └── studio-sendiri.html
├── assets/
│   ├── css/main.css           Seluruh design system dan aturan responsif
│   ├── js/app.js              Loader, menu, filter, slider, form, kursor
│   └── img/                   11 ilustrasi SVG, favicon, dan 7 kartu sosial PNG
├── robots.txt
├── sitemap.xml
└── README.md
```

## Art direction

- **Palet:** bone `#EFEAE1`, ink `#12100E`, clay `#B4432A`, moss `#2F3A33`, dengan dua
  kertas turunan untuk bidang dan garis.
- **Tipografi:** Instrument Serif (aksen italik), Inter Tight (teks dan display),
  JetBrains Mono (label, nomor, metadata).
- **Grid:** 12 kolom, gutter `clamp()`, garis rambut 1px, penomoran bagian `01–06`.
- **Citra:** semua ilustrasi adalah SVG buatan sendiri — denah, tampak, potongan, dan
  palet material. Kartu sosial PNG dihasilkan dari SVG yang sama, bukan foto.

## Momen tanda tangan

**Potongan A–A** di beranda: satu bidang yang bisa ditarik vertikal. Bagian atas
menampilkan render material; bagian bawah menampilkan gambar garis. Tarik dengan mouse
atau sentuh, atau gunakan tombol panah saat fokus pada handle.

- Nilai awal 54%, dapat dijangkau dengan keyboard (`Home`, `End`, `←`, `→`).
- `aria-valuenow` dan `aria-valuetext` diperbarui saat digeser.
- Pada perangkat sentuh, instruksi berubah menjadi "geser".
- Saat `prefers-reduced-motion: reduce`, transisi dan reveal dinonaktifkan, tetapi
  posisi potongan tetap bisa diubah.

## Aksesibilitas

- Skip link, urutan fokus logis, outline fokus 2px, tanpa jebakan fokus.
- Menu seluler: focus trap, `Escape`, `aria-expanded`, dan scroll lock.
- Kontras teks sekunder `#696055` ≥ 4.5:1 pada kedua latar kertas.
- `prefers-reduced-motion` dihormati di seluruh halaman.
- Gambar dekoratif `aria-hidden`; gambar konten memiliki alt deskriptif.
- Target sentuh utama ≥ 44px pada breakpoint seluler.

## Performa terukur (lokal, Chrome headless, 1440×1000)

| Metrik | Hasil |
|---|---|
| LCP | 860 ms |
| CLS | 0.0002 |
| FCP | 860 ms |
| Muatan awal | ±109 KB, 6 permintaan |
| Dependensi runtime | 0 (hanya Google Fonts) |

Angka ini diukur pada server lokal tanpa throttling, jadi bukan jaminan kondisi jaringan
nyata. Tanpa JavaScript, loader disembunyikan dan seluruh konten tetap terbaca; menu
seluler memerlukan JavaScript.

## Metadata & SEO

- Canonical, `og:type`, `og:site_name`, `og:url`, `og:locale`, `og:image` absolut, dan
  kartu Twitter ada di semua halaman yang diindeks.
- Studi kasus memakai kartu proyek masing-masing (800×600); halaman utama memakai
  `og-cover.png` (1200×630).
- `404.html` memakai `noindex, follow`.
- `sitemap.xml` mencakup 10 URL; `robots.txt` mengarah ke sitemap.

## Penilaian diri (Awwwards, jujur dan pesimistis)

| Kriteria | Bobot | Nilai | Catatan |
|---|---:|---:|---|
| Design | 40% | 7.7 | Sistem tipe dan grid konsisten di semua halaman; ilustrasi SVG menyatu dengan tata letak. |
| Usability | 30% | 7.8 | Metrik baik, keyboard dan reduced-motion lengkap; font eksternal masih satu titik gagal. |
| Creativity | 20% | 6.8 | Satu momen kuat yang lahir dari subjek (potongan arsitektur); pola slider sendiri bukan hal baru. |
| Content | 10% | 6.8 | Copy koheren dan spesifik, tetapi studio dan proyeknya fiktif. |

**Prediksi: ±7.5 / 10** — batas bawah wilayah "SOTD contender", bukan jaminan juri.
Nilai ini adalah penilaian penulis, bukan hasil penjurian Awwwards.

## Catatan

NUSA, alamat, telepon, tim, dan seluruh proyek adalah fiksi untuk keperluan portofolio.
Jangan gunakan sebagai entitas nyata tanpa mengganti data dan menghubungi pihak terkait.
