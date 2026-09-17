import React, { useState, useEffect } from "react";
import logoSekolah from "../../assets/logo74.png";
import {
  BookOpen,
  Users,
  CheckCircle,
  Globe,
  FileText,
  Sparkles,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  Instagram,
  Youtube,
  Video,
} from "lucide-react";

export default function Home({ onNavigateToCatalog }) {
  // State Slider Hero Banner
  const [currentSlide, setCurrentSlide] = useState(0);

  // State Data Dinamis Backend API
  const [newsList, setNewsList] = useState([]);
  const [studentWorks, setStudentWorks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Fetch Data dari API Backend
  useEffect(() => {
    // 1. Fetch Data Berita
    fetch("http://localhost:5000/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setNewsList(data.data);
        } else {
          setNewsList(dummyNews);
        }
      })
      .catch(() => setNewsList(dummyNews))
      .finally(() => setLoadingNews(false));

    // 2. Fetch Data Modul Digital
    fetch("http://localhost:5000/api/modules")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setStudentWorks(data.data);
        } else {
          setStudentWorks(dummyWorks);
        }
      })
      .catch(() => setStudentWorks(dummyWorks))
      .finally(() => setLoadingModules(false));

    // 3. Fetch Data Tim Pustakawan (Dinamis dari Backend API)
    fetch("http://localhost:5000/api/librarians")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setStaffList(data.data);
        } else {
          setStaffList(dummyStaff);
        }
      })
      .catch(() => setStaffList(dummyStaff))
      .finally(() => setLoadingStaff(false));
  }, []);

  // Data Dummy Fallback
  const dummyNews = [
    {
      id: 1,
      date: "15 September 2026",
      title: "Gerakan Literasi Digital SMKN 74 Tahun 2026",
      excerpt:
        "Perpustakaan menggalakkan program membaca e-book 15 menit sebelum KBM dimulai...",
      category: "Kegiatan",
    },
    {
      id: 2,
      date: "28 Agustus 2026",
      title: "Penambahan Modul Pembelajaran Kejuruan Terbaru",
      excerpt:
        "Koleksi modul Seni Tari dan Karawitan edisi 2026 kini telah siap diakses siswa...",
      category: "Pengumuman",
    },
    {
      id: 3,
      date: "10 Agustus 2026",
      title: "Sosialisasi Layanan Bebas Pustaka Online Kelas XII",
      excerpt:
        "Permohonan bebas pinjam buku untuk syarat kelulusan kini dapat diajukan secara daring...",
      category: "Layanan",
    },
  ];

  const dummyWorks = [
    {
      id: 1,
      title: "Perancangan Koreografi Tari Piring Kreasi Baru",
      author: "Rizky & Tim",
      year: "2024",
    },
    {
      id: 2,
      title: "Analisis Aransemen Gamelan Jawa Pelog Barang",
      author: "Dewi Melati",
      year: "2023",
    },
    {
      id: 3,
      title: "Naskah Pertunjukan Teater Drama Klasik SMKN 74",
      author: "Siti Rahma",
      year: "2024",
    },
  ];

  // Data Dummy Staf Pustakawan Fallback
  const dummyStaff = [
    { name: "Hj. Ratna Sari, M.Pd", role: "Kepala Perpustakaan" },
    { name: "Ahmad Subagja, S.IP", role: "Layanan Pemustaka" },
    { name: "Budi Santoso, S.Kom", role: "Pengelola IT & E-Resources" },
    { name: "Siti Aminah", role: "Administrasi & Sirkulasi" },
  ];

  // Data 4 Banner Slide
  const heroSlides = [
    {
      id: 1,
      tag: "Perpustakaan SMKN 74 Jakarta",
      title: "Cari, Baca, dan Temukan Buku Favoritmu Hari Ini.",
      desc: "Termasuk berbagai layanan informasi akademik dan referensi modul kejuruan untuk mendukung pembelajaran & kreativitas Anda di SMKN 74.",
      bgImage:
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 2,
      tag: "Koleksi Kejuruan Seni",
      tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      title: "MODUL & KARYA SENI PERTUNJUKAN",
      desc: "Temukan referensi naskah teater, instrumen karawitan, koreografi tari, dan materi musik barat langsung dari repositori sekolah.",
      bgImage:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 3,
      tag: "Layanan Digital Daring",
      tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      title: "BEBAS PUSTAKA KELAS XII ONLINE",
      desc: "Kemudahan pengajuan surat keterangan bebas pinjaman buku untuk syarat kelulusan secara online tanpa perlu mengantre.",
      bgImage:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 4,
      tag: "Literasi & Kreativitas",
      tagColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      title: "RUANG BACA NYAMAN & MODERN",
      desc: "Fasilitas ruang baca fisik perpustakaan SMKN 74 siap mendukung diskusi, riset, dan kegiatan literasi harian seluruh pemustaka.",
      bgImage:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  // Efek Transisi Otomatis (Setiap 5 Detik)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  // Quick Links Layanan Utama
  const quickLinks = [
    {
      title: "Katalog Online (OPAC)",
      desc: "Cari koleksi buku fisik & ketersediaan rak",
      icon: BookOpen,
      action: onNavigateToCatalog,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      title: "Buku Digital / Modul",
      desc: "Akses & unduh modul kejuruan digital",
      icon: Globe,
      action: () => alert("Menuju ke Repositori Buku Digital / Modul"),
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    {
      title: "Bebas Pustaka",
      desc: "Layanan surat keterangan bebas pinjaman",
      icon: CheckCircle,
      action: () => alert("Menuju ke Layanan Surat Bebas Pustaka"),
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "Keanggotaan",
      desc: "Informasi kartu & hak akses pemustaka",
      icon: Users,
      action: () => alert("Menuju ke Info Keanggotaan"),
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
  ];

  // Data Dummy Koleksi Terpopuler
  const popularBooks = [
    {
      title: "Modul Pembelajaran Seni Tari Tradisional",
      year: "2024",
      category: "Seni Tari",
    },
    {
      title: "Dasar-Dasar Kejuruan Seni Karawitan",
      year: "2023",
      category: "Seni Karawitan",
    },
    {
      title: "Teknik Olah Vokal & Keaktoran Seni Teater",
      year: "2024",
      category: "Seni Teater",
    },
    {
      title: "Harmoni & Solfeggio Musik Barat",
      year: "2024",
      category: "Seni Musik",
    },
  ];

  return (
    <div className="w-full animate-fade-in text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-10 sm:space-y-16">
        {/* 1. HERO BANNER CAROUSEL SLIDER */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 min-h-[380px] sm:min-h-[420px] md:min-h-[460px] flex items-center bg-slate-900 text-white">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${
                idx === currentSlide
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Gambar Latar Belakang Overlay Dark Blur */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 scale-105"
                style={{ backgroundImage: `url(${slide.bgImage})` }}
              >
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
              </div>

              {/* Konten Teks Slide */}
              <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-5 px-4 sm:px-6 relative z-20">
                <span
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm border ${
                    slide.tagColor ||
                    "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {slide.tag}
                </span>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                  {slide.title}
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
                  {slide.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Tombol Navigasi Kiri & Kanan Carousel */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 z-30 p-1.5 sm:p-2.5 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white backdrop-blur-md transition border border-white/10 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 z-30 p-1.5 sm:p-2.5 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white backdrop-blur-md transition border border-white/10 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dots Indikator Slide */}
          <div className="absolute bottom-4 sm:bottom-5 inset-x-0 z-30 flex justify-center items-center gap-1.5 sm:gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentSlide
                    ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-amber-500"
                    : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </section>

        {/* 2. QUICK ACCESS LAYANAN (4 ICON CIRCLE) */}
        <section id="layanan" className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-slate-900">
              Akses Layanan Perpustakaan
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kemudahan akses informasi & administrasi pustaka dalam satu pintu
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon;

              return (
                <div
                  key={idx}
                  onClick={item.action}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400/50 transition cursor-pointer flex flex-col items-center text-center group"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center mb-3 sm:mb-4 transition group-hover:scale-110 ${item.color}`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-600 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. KOLEKSI TERPOPULER & MODUL KEJURUAN */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Kolom Kiri: Koleksi Terpopuler */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Koleksi Buku Terpopuler
                </h3>

                <button
                  onClick={onNavigateToCatalog}
                  className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 shrink-0"
                >
                  Lihat Semua <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <ul className="divide-y divide-slate-100 text-xs sm:text-sm">
                {popularBooks.map((book, idx) => (
                  <li
                    key={idx}
                    onClick={onNavigateToCatalog}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">
                          {book.title}
                        </h4>

                        <span className="text-[11px] sm:text-xs text-slate-400 block truncate">
                          Kategori: {book.category} ({book.year})
                        </span>
                      </div>
                    </div>

                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom Kanan: Modul & Karya Akhir Siswa (DINAMIS FROM API) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Modul & Repository Kejuruan
                </h3>

                <span className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                  Siswa SMKN 74
                </span>
              </div>

              <ul className="divide-y divide-slate-100 text-xs sm:text-sm">
                {studentWorks.map((work, idx) => (
                  <li
                    key={work.id || idx}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">
                          {work.title}
                        </h4>

                        <span className="text-[11px] sm:text-xs text-slate-400 block truncate">
                          Oleh: {work.author} • {work.year}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. BERITA PERPUSTAKAAN (DINAMIS FROM API) */}
        <section className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-slate-900">
                Berita & Pengumuman
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Informasi kegiatan literasi dan kabar perpustakaan SMKN 74
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {newsList.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition space-y-3 p-4 sm:p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-36 sm:h-40 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200/50 overflow-hidden">
                    {news.image ? (
                      <img
                        src={
                          news.image.startsWith("http")
                            ? news.image
                            : `http://localhost:5000/uploads/${news.image}`
                        }
                        alt={news.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Calendar className="w-8 h-8 mb-1 text-slate-300" />
                        <span className="text-xs">Gambar Berita</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-full">
                      {news.category || "Kegiatan"}
                    </span>

                    <span className="text-slate-400 font-medium">
                      {news.date ||
                        (news.created_at
                          ? new Date(news.created_at).toLocaleDateString(
                              "id-ID",
                            )
                          : "Terbaru")}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2">
                    {news.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {news.excerpt}
                  </p>
                </div>

                <button className="text-xs text-amber-600 font-bold hover:underline pt-2 flex items-center gap-1 cursor-pointer">
                  Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 5. STAF PERPUSTAKAAN / TIM PUSTAKAWAN (DINAMIS FROM API) */}
        <section className="max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-slate-900">
              Tim Pustakawan
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Siap melayani kebutuhan literasi & referensi belajar siswa SMKN 74
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {staffList.map((staf, idx) => (
              <div
                key={staf.id || idx}
                className="w-full sm:w-64 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-amber-400/50 transition"
              >
                <div className="w-20 h-20 bg-amber-50 rounded-full border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner overflow-hidden aspect-square shrink-0">
                  {staf.photo ? (
                    <img
                      src={`http://localhost:5000/uploads/librarians/${staf.photo}`}
                      alt={staf.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900">
                  {staf.name}
                </h4>

                <span className="text-xs text-amber-700 font-semibold bg-amber-100/50 px-2.5 py-0.5 rounded-full">
                  {staf.role}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 6. FOOTER SECTION */}
      <footer className="w-full bg-[var(--color-brand-primary,#0b1329)] text-slate-300 pt-10 sm:pt-14 pb-8 border-t border-slate-800 font-sans mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800/80">
            {/* KOLOM 1: TENTANG PERPUSTAKAAN */}
            <div className="md:col-span-2 space-y-4 pr-0 md:pr-6">
              <div className="flex items-center space-x-3">
                <img
                  src={logoSekolah}
                  alt="Logo SMKN 74"
                  className="h-10 sm:h-12 w-auto object-contain"
                />

                <div>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-500 uppercase block">
                    PERPUSTAKAAN DIGITAL
                  </span>

                  <span className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-wide leading-none">
                    SMK Negeri 74 Jakarta
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
                Pusat sumber belajar dan literasi digital SMKN 74 Jakarta.
                Menyediakan koleksi buku cetak, naskah drama teater, modul
                kejuruan seni pertunjukan, dan referensi akademik secara
                terintegrasi untuk mendukung kegiatan pembelajaran seluruh
                pemustaka.
              </p>

              {/* Badge Instansi */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-amber-400 border border-amber-500/30 rounded-md tracking-wider uppercase bg-amber-500/10">
                  PERPUSTAKAAN SEKOLAH
                </span>

                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-slate-300 border border-slate-700 rounded-md tracking-wider uppercase bg-slate-900/40">
                  PEMPROV DKI JAKARTA
                </span>
              </div>
            </div>

            {/* KOLOM 2: INFORMASI PERPUSTAKAAN */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-widest text-amber-500 uppercase">
                INFORMASI
              </h4>

              <div className="text-xs sm:text-sm text-slate-400 space-y-2.5 leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="shrink-0">📍</span>
                  <span>
                    Jl. Moch. Kahfi II, RT.11/RW.8, Srengseng Sawah, Kec.
                    Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota
                    Jakarta 12640
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <span>📞</span> (021) 7864-216
                </p>

                <p className="flex items-center gap-2">
                  <span>📧</span> perpustakaan@smkn74jakarta.sch.id
                </p>

                <p className="flex items-center gap-2">
                  <span>📸</span> @perpus_smkn74jkt
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-xs sm:text-sm">
                  <p className="font-bold text-white mb-1">
                    🕒 Jam Operasional:
                  </p>
                  <p>Senin - Jumat: 06.30 - 15.00 WIB</p>
                  <p className="text-slate-500">
                    Sabtu, Minggu & Libur Nasional: Tutup
                  </p>
                </div>
              </div>
            </div>

            {/* KOLOM 3: LINK TERKAIT */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-widest text-amber-500 uppercase">
                LINK TERKAIT
              </h4>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                <li>
                  <a
                    href="https://www.perpusnas.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>🌐</span> Perpustakaan Nasional RI
                  </a>
                </li>

                <li>
                  <a
                    href="https://e-resources.perpusnas.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>📚</span> E-Resources Perpusnas
                  </a>
                </li>

                <li>
                  <a
                    href="https://perpustakaan.jakarta.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>🏢</span> Dispusip DKI Jakarta (JakLitera)
                  </a>
                </li>

                <li>
                  <a
                    href="https://smkn74jakarta.sch.id"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>🏫</span> Web Resmi SMKN 74
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
            <p>© 2026 Perpustakaan SMKN 74 Jakarta. All rights reserved.</p>

            <div className="flex items-center space-x-3">
              <a
                href="https://www.instagram.com/smkn74jkt?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href="#"
                className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"
              >
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
