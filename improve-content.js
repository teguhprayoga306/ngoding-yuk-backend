const fs = require('fs');
const path = require('path');

const improvedTopics = {
  topics: [
    {
      id: "html_basics",
      title: "HTML Dasar",
      description: "Pelajari struktur halaman web sederhana: tag, elemen, teks, dan gambar.",
      courseId: "frontend_mastery",
      level: "Pemula",
      duration: "25-35 menit",
      icon: "fas fa-code",
      category: "frontend",
      content: {
        overview: "HTML (HyperText Markup Language) adalah fondasi dari setiap website. HTML digunakan untuk membuat struktur halaman web dengan menggunakan tag-tag yang menjelaskan makna dari setiap bagian konten. Dengan memahami HTML, Anda dapat membuat halaman web yang terstruktur dengan baik dan mudah dipahami oleh browser serta mesin pencari.",
        lessons: [
          "Pengenalan tag HTML",
          "Elemen dasar: heading, paragraph, list",
          "Atribut HTML",
          "Semantic HTML"
        ],
        resources: [
          "https://developer.mozilla.org/en-US/docs/Web/HTML",
          "https://html.spec.whatwg.org/"
        ],
        sections: [
          {
            title: "1. Pengenalan HTML dan Struktur Dasar",
            text: "HTML adalah bahasa markup yang terdiri dari tag-tag yang memberi instruksi pada browser untuk menampilkan konten. Setiap halaman HTML harus memiliki struktur dasar dengan elemen-elemen penting:\n\n• <!DOCTYPE html>: Memberi tahu browser jenis dokumen (HTML5)\n• <html>: Root element dari seluruh halaman\n• <head>: Berisi metadata, title, dan link ke resource (tidak terlihat)\n• <body>: Berisi konten yang ditampilkan di halaman (terlihat oleh user)\n\nMemahami struktur dasar ini penting agar halaman HTML dapat berfungsi dengan baik di semua browser.",
            code: "<!DOCTYPE html>\n<html lang=\"id\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Halaman Saya - NGODING YUK</title>\n  </head>\n  <body>\n    <h1>Selamat datang di halaman saya!</h1>\n    <p>Ini adalah paragraf pertama saya di halaman ini.</p>\n  </body>\n</html>"
          },
          {
            title: "2. Heading dan Paragraf",
            text: "Heading (<h1> hingga <h6>) digunakan untuk judul dan subjudul halaman. Gunakan heading secara hierarki yang tepat:\n\n• <h1>: Hanya satu per halaman untuk judul utama\n• <h2>-<h3>: Untuk subjudul dan membagi konten\n• <h4>-<h6>: Untuk detail dan sub-bagian kecil\n• <p>: Untuk paragraf teks biasa\n\nGunakan heading dengan benar untuk:\n✓ Struktur konten yang jelas\n✓ SEO yang lebih baik (mesin pencari memahami struktur)\n✓ Aksesibilitas lebih baik (screen reader dapat navigasi)",
            code: "<body>\n  <h1>NGODING YUK - Belajar Programming</h1>\n  \n  <h2>Apa itu NGODING YUK?</h2>\n  <p>NGODING YUK adalah platform pembelajaran programming online yang interaktif dan menyenangkan. Kami menyediakan kursus dari HTML dasar hingga algoritma yang mudah dipahami.</p>\n  \n  <h2>Keunggulan Platform Kami</h2>\n  \n  <h3>1. Konten Berkualitas</h3>\n  <p>Materi pembelajaran kami dirancang oleh praktisi berpengalaman...</p>\n  \n  <h3>2. Interaktif dan Menyenangkan</h3>\n  <p>Setiap materi dilengkapi dengan contoh dan latihan soal...</p>\n  \n  <h2>Daftar Sekarang</h2>\n  <p>Jangan ragu untuk bergabung dengan ribuan pelajar lainnya!</p>\n</body>"
          },
          {
            title: "3. List: Unordered, Ordered, dan Description",
            text: "List digunakan untuk menampilkan item-item dalam urutan atau tanpa urutan tertentu. Ada tiga jenis list utama yang perlu diketahui:\n\n• <ul> (Unordered List): Daftar tanpa urutan dengan bullet point\n  - Cocok untuk daftar fitur, requirements, atau hal yang tidak terurut\n• <ol> (Ordered List): Daftar berurutan dengan nomor\n  - Cocok untuk langkah-langkah, instruksi, atau hal yang berurutan\n• <dl> (Description List): Daftar istilah dengan penjelasan\n  - Cocok untuk glossary atau definisi\n\nSetiap item dalam list dibungkus dengan tag <li> (list item).",
            code: "<!-- Unordered List: Syarat Pendaftaran -->\n<h3>Syarat Mendaftar:</h3>\n<ul>\n  <li>Berusia minimal 17 tahun</li>\n  <li>Memiliki email yang aktif</li>\n  <li>Setuju dengan syarat dan ketentuan</li>\n  <li>Memiliki koneksi internet yang stabil</li>\n</ul>\n\n<!-- Ordered List: Langkah-langkah -->\n<h3>Langkah-langkah Mendaftar:</h3>\n<ol>\n  <li>Klik tombol \"Daftar\" di halaman utama</li>\n  <li>Isi formulir dengan data pribadi Anda</li>\n  <li>Cek email dan klik link verifikasi</li>\n  <li>Login dengan username dan password Anda</li>\n  <li>Mulai belajar dan raih sertifikat!</li>\n</ol>\n\n<!-- Description List: Glossary -->\n<dl>\n  <dt>HTML</dt>\n  <dd>HyperText Markup Language - Bahasa markup untuk struktur halaman web</dd>\n  <dt>CSS</dt>\n  <dd>Cascading Style Sheets - Bahasa styling untuk tampilan halaman</dd>\n  <dt>JavaScript</dt>\n  <dd>Bahasa pemrograman untuk membuat halaman web interaktif</dd>\n</dl>"
          },
          {
            title: "4. Tautan (Links) dan Navigasi",
            text: "Tag <a> (anchor) digunakan untuk membuat tautan ke halaman lain, email, atau file. Atribut href menentukan tujuan tautan. Ada beberapa jenis tautan yang perlu dipahami:\n\n• Internal: Link ke halaman lain dalam website\n• Eksternal: Link ke website lain\n• Email: Link untuk mengirim email\n• Anchor: Link ke bagian tertentu dalam halaman (menggunakan #)\n• Telephone: Link untuk menelepon\n\nUntuk link eksternal, selalu gunakan target=\"_blank\" agar membuka tab baru.",
            code: "<!-- Navigation Menu -->\n<nav>\n  <a href=\"/index.html\">Beranda</a>\n  <a href=\"/courses.html\">Kursus</a>\n  <a href=\"/about.html\">Tentang Kami</a>\n  <a href=\"/contact.html\">Kontak</a>\n</nav>\n\n<!-- Link eksternal - buka di tab baru -->\n<p>Pelajari lebih lanjut di\n  <a href=\"https://www.w3schools.com\" target=\"_blank\">W3Schools</a>\n</p>\n\n<!-- Link email -->\n<p>Hubungi kami di\n  <a href=\"mailto:info@ngodingyuk.com\">info@ngodingyuk.com</a>\n</p>\n\n<!-- Link anchor (internal navigation) -->\n<p><a href=\"#bagian-2\">Lompat ke Bagian 2</a></p>\n<!-- ... konten ... -->\n<h2 id=\"bagian-2\">Bagian 2</h2>"
          },
          {
            title: "5. Gambar dan Media",
            text: "Tag <img> digunakan untuk menyisipkan gambar dalam halaman. Atribut yang penting:\n\n• src: Path ke file gambar (REQUIRED)\n• alt: Teks alternatif jika gambar tidak bisa ditampilkan (REQUIRED)\n• width, height: Ukuran gambar\n• title: Tooltip yang muncul saat hover\n\nSELALU sediakan atribut alt untuk:\n✓ Aksesibilitas - screen reader dapat mendeskripsikan gambar\n✓ SEO - mesin pencari memahami konten gambar\n✓ UX - user tahu apa gambar jika gagal load\n\nGunakan format gambar yang tepat:\n• JPEG: Untuk foto dan gambar kompleks\n• PNG: Untuk graphic dan image dengan transparency\n• WebP: Format modern untuk ukuran lebih kecil",
            code: "<!-- Gambar sederhana dengan alt text -->\n<img src=\"/images/logo.png\" alt=\"Logo NGODING YUK\" width=\"200\" height=\"100\">\n\n<!-- Gambar responsive (menyesuaikan ukuran layar) -->\n<img src=\"/images/banner.jpg\" alt=\"Banner pembelajaran online\" \n     style=\"width: 100%; height: auto; max-width: 800px;\">\n\n<!-- Gambar dengan caption -->\n<figure>\n  <img src=\"/images/diagram.png\" alt=\"Diagram alur program\">\n  <figcaption>Gambar 1: Diagram alur program sederhana</figcaption>\n</figure>\n\n<!-- Video HTML5 -->\n<video width=\"640\" height=\"360\" controls poster=\"/images/video-thumb.jpg\">\n  <source src=\"/videos/tutorial.mp4\" type=\"video/mp4\">\n  <p>Browser Anda tidak mendukung video HTML5.</p>\n</video>"
          },
          {
            title: "6. Form dan Input",
            text: "Form digunakan untuk mengumpulkan input dari pengguna. Elemen penting dalam form:\n\n• <form>: Container untuk form (action = URL tujuan, method = GET/POST)\n• <label>: Label untuk input (atribut for terhubung dengan input id)\n• <input>: Input field (type: text, password, email, number, checkbox, radio, dll)\n• <textarea>: Area teks multi-baris\n• <select>: Dropdown menu\n• <button>: Tombol submit atau action\n\nTIPT PENTING:\n✓ SELALU gunakan label untuk setiap input\n✓ Gunakan type yang tepat (email, number, dll) untuk validasi otomatis\n✓ Tambahkan placeholder untuk hint\n✓ Gunakan required untuk field wajib",
            code: "<form action=\"/submit\" method=\"POST\">\n  <!-- Text input -->\n  <label for=\"nama\">Nama Lengkap:</label>\n  <input type=\"text\" id=\"nama\" name=\"nama\" \n         placeholder=\"Masukkan nama lengkap\" required>\n\n  <!-- Email input -->\n  <label for=\"email\">Email:</label>\n  <input type=\"email\" id=\"email\" name=\"email\" \n         placeholder=\"example@email.com\" required>\n\n  <!-- Password input -->\n  <label for=\"password\">Password:</label>\n  <input type=\"password\" id=\"password\" name=\"password\" \n         placeholder=\"Minimal 8 karakter\" minlength=\"8\" required>\n\n  <!-- Number input -->\n  <label for=\"umur\">Umur:</label>\n  <input type=\"number\" id=\"umur\" name=\"umur\" min=\"17\" max=\"100\">\n\n  <!-- Textarea -->\n  <label for=\"pesan\">Pesan Anda:</label>\n  <textarea id=\"pesan\" name=\"pesan\" rows=\"5\" cols=\"40\" \n            placeholder=\"Tulis pesan Anda di sini...\"></textarea>\n\n  <!-- Select/dropdown -->\n  <label for=\"kategori\">Kategori:</label>\n  <select id=\"kategori\" name=\"kategori\" required>\n    <option value=\"\">-- Pilih kategori --</option>\n    <option value=\"pemula\">Pemula</option>\n    <option value=\"menengah\">Menengah</option>\n    <option value=\"lanjutan\">Lanjutan</option>\n  </select>\n\n  <!-- Buttons -->\n  <button type=\"submit\">Kirim</button>\n  <button type=\"reset\">Bersihkan</button>\n</form>"
          },
          {
            title: "7. Table (Tabel) untuk Data Terstruktur",
            text: "Tag <table> digunakan untuk menampilkan data terstruktur dalam baris dan kolom. Elemen penting:\n\n• <table>: Container untuk seluruh tabel\n• <thead>: Header tabel (baris judul)\n• <tbody>: Isi tabel utama\n• <tfoot>: Footer tabel (opsional, biasanya untuk total/ringkasan)\n• <tr>: Baris tabel\n• <th>: Header cell (baris judul)\n• <td>: Data cell (isi tabel)\n\nPETINGATAN: Gunakan tabel HANYA untuk data tabular, bukan untuk layout halaman!",
            code: "<table border=\"1\" cellpadding=\"10\" cellspacing=\"0\">\n  <caption>Daftar Nilai Siswa NGODING YUK - Q2 2026</caption>\n  \n  <thead>\n    <tr>\n      <th>No</th>\n      <th>Nama Siswa</th>\n      <th>Nilai Akhir</th>\n      <th>Grade</th>\n      <th>Status</th>\n    </tr>\n  </thead>\n  \n  <tbody>\n    <tr>\n      <td>1</td>\n      <td>Andi Wijaya</td>\n      <td>85</td>\n      <td>A</td>\n      <td>Lulus</td>\n    </tr>\n    <tr>\n      <td>2</td>\n      <td>Budi Santoso</td>\n      <td>78</td>\n      <td>B</td>\n      <td>Lulus</td>\n    </tr>\n    <tr>\n      <td>3</td>\n      <td>Citra Dewi</td>\n      <td>92</td>\n      <td>A</td>\n      <td>Lulus</td>\n    </tr>\n    <tr>\n      <td>4</td>\n      <td>Doni Hermawan</td>\n      <td>65</td>\n      <td>C</td>\n      <td>Lulus</td>\n    </tr>\n  </tbody>\n  \n  <tfoot>\n    <tr>\n      <th colspan=\"2\">Rata-rata Kelas</th>\n      <td>80</td>\n      <td>B</td>\n      <td>100%</td>\n    </tr>\n  </tfoot>\n</table>"
          },
          {
            title: "8. Semantic HTML untuk SEO dan Aksesibilitas",
            text: "Semantic HTML menggunakan tag yang menjelaskan makna konten dengan jelas. Ini membantu:\n\n✓ Search engine memahami struktur halaman (SEO lebih baik)\n✓ Screen reader dapat membaca halaman dengan benar (aksesibilitas)\n✓ Code lebih mudah dipahami dan dipelihara\n✓ Kompatibilitas dengan berbagai browser dan device\n\nTag semantic penting:\n• <header>: Header halaman atau section\n• <nav>: Navigation menu\n• <main>: Konten utama halaman (hanya satu per halaman)\n• <section>: Bagian atau topic tertentu\n• <article>: Konten independen (post, news, komentar)\n• <aside>: Sidebar atau konten sampingan\n• <footer>: Footer halaman\n• <figure> & <figcaption>: Gambar dengan penjelasan",
            code: "<header>\n  <h1>NGODING YUK - Platform Belajar Programming</h1>\n  <nav>\n    <a href=\"/\">Beranda</a>\n    <a href=\"/courses\">Kursus</a>\n    <a href=\"/blog\">Blog</a>\n    <a href=\"/contact\">Kontak</a>\n  </nav>\n</header>\n\n<main>\n  <article>\n    <h2>Judul Artikel: Tips Belajar Programming</h2>\n    <p>By <strong>Tim NGODING YUK</strong> \n       on <time datetime=\"2026-06-15\">15 Juni 2026</time></p>\n    \n    <section>\n      <h3>Pendahuluan</h3>\n      <p>Belajar programming bisa menjadi mudah dengan cara yang tepat...</p>\n    </section>\n    \n    <section>\n      <h3>Tips Penting</h3>\n      <p>Berikut adalah tips yang telah terbukti membantu ribuan pelajar\n         <mark>mencapai tujuan mereka</mark> dalam belajar programming.</p>\n    </section>\n  </article>\n  \n  <aside>\n    <h3>Artikel Terkait</h3>\n    <ul>\n      <li><a href=\"#\">Cara Memilih Bahasa Programming</a></li>\n      <li><a href=\"#\">Kesalahan Umum Pemula</a></li>\n      <li><a href=\"#\">Resource Belajar Terbaik</a></li>\n    </ul>\n  </aside>\n</main>\n\n<footer>\n  <p>&copy; 2026 NGODING YUK. Semua hak dilindungi.</p>\n  <p>\n    <a href=\"/privacy\">Privacy Policy</a> | \n    <a href=\"/terms\">Syarat & Ketentuan</a>\n  </p>\n</footer>"
          }
        ]
      },
      quiz: [
        {
          id: 1,
          question: "Tag HTML mana yang digunakan untuk heading utama halaman?",
          options: ["<h1>", "<heading>", "<title>", "<head>"],
          answer: 0
        },
        {
          id: 2,
          question: "Atribut mana yang WAJIB ada pada tag <img> untuk aksesibilitas?",
          options: ["title", "alt", "description", "text"],
          answer: 1
        },
        {
          id: 3,
          question: "Tag mana yang digunakan untuk membuat list tanpa urutan (bullet)?",
          options: ["<ol>", "<ul>", "<li>", "<list>"],
          answer: 1
        }
      ]
    }
  ]
};

// Write improved topics to file
const outputPath = path.join(__dirname, 'data/topics-improved-full.json');
fs.writeFileSync(outputPath, JSON.stringify(improvedTopics, null, 2), 'utf8');
console.log(`✅ Improved topics created: ${outputPath}`);
console.log(`Total topics: ${improvedTopics.topics.length}`);
