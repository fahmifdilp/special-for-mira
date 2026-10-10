### Fix #6 - Dino Chat Production Configuration

| Field | Detail |
| --- | --- |
| Tanggal | 2026-10-10 |
| File | `api/dino-chat.js`, Vercel Production environment, `handoffs/dino-chat-deploy.md` |
| Masalah | Endpoint Dino di production sebelumnya mengembalikan `503` karena kredensial belum tersedia di Vercel dan 9Router lokal tidak dapat dijangkau dari cloud. |
| Akar | Environment variable Production belum dikonfigurasi; endpoint `localhost` hanya berlaku di komputer pengembang. |
| Fix | Pemilik project menambahkan `ADACODE_API_KEY`, `ADACODE_BASE_URL`, dan `ADACODE_MODEL` sebagai environment variable Production tanpa mencatat nilainya; deployment production dibuat ulang. |
| Verifikasi | Deployment `dpl_hEpJxd2KxbkZbq2LupnYd61JQJqm` berstatus `READY`; `POST /api/dino-chat` production mengembalikan `HTTP 200` dan balasan Dino (panjang 58 karakter); `npm.cmd run lint` dan `npm.cmd run build` lulus. |
| Pelajaran | Environment variable baru berlaku pada deployment berikutnya; endpoint cloud harus dipakai untuk fungsi server Vercel, bukan `localhost`. |
| Log Keyword | `dino-chat-deploy`, `vercel-production-env`, `api-dino-chat-200`, `special-for-mira` |
| Deploy | ✅ LIVE 2026-10-10 — `https://special-for-mira.vercel.app/` |

### Fix #5 - Musik Latar Otomatis Loop Setelah Masuk

| Field | Detail |
| --- | --- |
| Tanggal | 2026-10-08 |
| File | `src/App.jsx`, `src/data/content.js`, `public/audio/dino-daydream.wav`, `README.md` |
| Masalah | Lagu latar baru berjalan setelah tombol `Music` ditekan, padahal pengalaman diinginkan langsung ditemani musik setelah masuk. |
| Akar | Audio dibuat di komponen pengalaman setelah mount; selain membutuhkan klik kedua, cleanup React Strict Mode sempat menghentikan audio awal. WAV 22.05 kHz juga ditolak oleh Chrome `Audio` element meskipun decoder umum dapat membacanya. |
| Fix | Buat audio dan panggil `play()` langsung dari gesture `Mulai main`, set `loop = true`, teruskan promise start ke pengalaman, dan pertahankan tombol `Music` sebagai mute/unmute. Kepemilikan audio dipisahkan agar cleanup development tidak mematikan audio yang dikelola `App`. Loop dibuat ulang sebagai PCM WAV mono 44.1 kHz untuk kompatibilitas browser. |
| Verifikasi | Chrome CDP dengan klik mouse tepercaya: setelah masuk `play=1`, `pause=0`, ikon Pause tampil, tidak ada toast error; setelah 2.2 detik jumlah play tetap `1` (loop berjalan); toggle menghasilkan `pause=1`; replay kembali ke opening. `npm.cmd run lint` dan `npm.cmd run build` lulus tanpa error. |
| Pelajaran | Autoplay yang aman harus dimulai dari gesture pengguna yang memang sudah ada, bukan dari effect mount; aset audio juga perlu diuji pada media element browser, bukan hanya decoder file. |
| Log Keyword | `autoplay-after-open`, `background-loop`, `strict-mode-audio`, `44.1khz`, `music-toggle`, `dino-daydream` |
| Deploy | BELUM DEPLOY; terverifikasi pada local dev server dan production build. |

### Fix #4 - Background Music Orisinal Dino Daydream

| Field | Detail |
| --- | --- |
| Tanggal | 2026-10-08 |
| File | `public/audio/dino-daydream.wav`, `scripts/generate-dino-loop.mjs`, `src/data/content.js`, `src/App.jsx`, `README.md` |
| Masalah | Tombol Music masih menunjuk ke placeholder `song.mp3`, sehingga pengalaman tidak memiliki lagu latar yang langsung bisa dipakai. |
| Akar | Tidak ada aset audio yang dibundel; tombol hanya menunggu file pengguna di `public/audio`. |
| Fix | Buat loop orisinal 20 detik bernuansa playful/chiptune ringan (melodi pentatonik, bass, kick, snare, hi-hat, dan chirp dino), simpan sebagai WAV PCM mono `dino-daydream.wav`, lalu arahkan `content.music.source` ke aset tersebut. Generator dipertahankan agar loop dapat dibuat ulang atau dikembangkan tanpa mengambil musik berhak cipta. |
| Verifikasi | WAV tervalidasi dengan `ffprobe` dan Python: PCM s16le, 44.1 kHz, mono, 20.0 detik, sekitar 1.76 MB; Chrome CDP dengan klik mouse tepercaya memuat URL audio, tombol Music berhasil ON lalu OFF tanpa toast error atau runtime error. `npm.cmd run lint` dan `npm.cmd run build` lulus tanpa error. |
| Pelajaran | Aset musik orisinal yang ringan dan user-controlled lebih aman untuk deployment personal daripada autoplay atau unduhan musik pihak ketiga. |
| Log Keyword | `dino-daydream`, `background-music`, `wav`, `20-second-loop`, `music-toggle`, `original-audio` |
| Deploy | BELUM DEPLOY; terverifikasi pada local dev server dan production build. |

### Fix #3 - Efek Suara Pembuka Dino

| Field | Detail |
| --- | --- |
| Tanggal | 2026-10-08 |
| File | `src/App.jsx`, `README.md` |
| Masalah | Opening screen hanya memberi feedback visual; belum ada suara lucu ketika Mira mulai bermain. |
| Akar | Tidak ada efek suara lokal dan autoplay audio tidak aman untuk browser modern. |
| Fix | Tambah `playOpeningSound()` berbasis Web Audio API: bunyi triangle “boing” pendek dengan sparkle nada tinggi, dipicu oleh klik **Mulai main** sehingga memenuhi aturan user gesture. Audio dibuat sementara lalu ditutup; jika Web Audio tidak tersedia, website tetap terbuka tanpa error. |
| Verifikasi | Chrome CDP lokal: klik pembuka membuat tepat `1` `AudioContext`, berpindah dari opening screen ke `.dino-app`, dan tidak menghasilkan runtime error. Setelah API audio dinonaktifkan secara simulasi, pengalaman tetap terbuka normal. `npm.cmd run lint` dan `npm.cmd run build` lulus tanpa error. |
| Pelajaran | SFX pendek berbasis Web Audio cocok untuk interaksi playful tanpa menambah aset biner atau memaksa autoplay; selalu sediakan fallback tanpa audio. |
| Log Keyword | `opening-sfx`, `boing`, `sparkle`, `AudioContext`, `user-gesture`, `autoplay-safe` |
| Deploy | BELUM DEPLOY; terverifikasi pada local dev server dan production build. |

### Fix #2 - Dino Dash Tidak Menghukum Tabrakan Kaktus

| Field | Detail |
| --- | --- |
| Tanggal | 2026-10-08 |
| File | `src/App.jsx`, `src/data/content.js`, `src/index.css` |
| Masalah | Skor bertambah setiap tombol **Lompat!** ditekan dan dino tidak pernah gagal saat menyentuh kaktus, sehingga game tidak memiliki tantangan nyata. |
| Akar | Dino Dash hanya memakai tombol sebagai penghitung skor; gerakan kaktus berupa animasi CSS yang tidak pernah dibandingkan dengan posisi dino. |
| Fix | Skor kini bertambah setelah kaktus benar-benar melewati dino. Loop `requestAnimationFrame` memeriksa hitbox aktual dino dan dua kaktus; tabrakan menghentikan lari, mengembalikan skor ke `0/8`, dan menampilkan tombol **Coba lagi**. Pola kaktus dibuat bergantian dengan jarak tetap, sedangkan lompatan diperpanjang agar menantang tetapi tetap adil. |
| Verifikasi | Chrome CDP lokal: diam menghasilkan tabrakan dan `0/8`; setelah berhasil mencapai `2/8`, sengaja tidak melompat menghasilkan reset `2/8 -> 0/8`; autopilot timing menyelesaikan delapan kaktus sampai `8/8` tanpa tabrakan dan kedua animasi berhenti. Viewport 320 px: tidak ada horizontal overflow, banner tabrakan tetap di dalam arena, dan tombol selebar 248 px. Tidak ada runtime error. `npm.cmd run lint` dan `npm.cmd run build` lulus tanpa error. |
| Pelajaran | Skor game harus berasal dari keberhasilan melewati rintangan, bukan dari input pemain; collision detection perlu memakai posisi DOM tertransformasi agar konsisten di desktop dan mobile. |
| Log Keyword | `dino-dash`, `kaktus`, `collision`, `reset-score`, `requestAnimationFrame`, `2-to-0`, `8-of-8` |
| Deploy | BELUM DEPLOY; terverifikasi pada local dev server dan production build. |

### Fix #1 - Tombol Pencet Dino Tidak Membuat Dino Melompat

| Field | Detail |
| --- | --- |
| Tanggal | 2026-10-08 |
| File | `src/App.jsx`, `src/index.css`, `vite.config.js` |
| Masalah | Tombol **Pencet dino** hanya mengganti status dan teks; karakter tidak bergerak sehingga klik terasa tidak merespons. |
| Akar | `tapDino()` tidak memiliki state animasi lompat dan `DinoSvg` hanya menerima animasi `celebrate`. |
| Fix | Tambah state `dinoJumping`, animasi naik-turun 560 ms, label **BOING!**, teks tombol dinamis, mode joget, dan Dino Disco dengan tiga gerakan. Profile browser smoke-test juga dikecualikan dari watcher Vite agar file Cookie Chrome tidak memicu `EBUSY`. |
| Verifikasi | Chrome CDP lokal: posisi atas dino berubah `641.14px -> 617.95px` (naik `23.19px`) lalu kembali `641.19px`; retest final naik `24.03px` lalu kembali tepat ke delta `0px`. Badge `BOING!`, counter `1x`, mode joget, dan Dino Disco terdeteksi aktif. `npm.cmd run lint` dan `npm.cmd run build` lulus tanpa error. |
| Pelajaran | Setiap tombol karakter perlu feedback visual langsung, bukan hanya perubahan copy atau state tersembunyi. |
| Log Keyword | `dino-jump`, `pencet-dino`, `BOING`, `dino-disco`, `EBUSY` |
| Deploy | BELUM DEPLOY; terverifikasi pada local production preview. |
