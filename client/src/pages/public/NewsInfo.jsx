import React, { useState, useEffect } from "react";
import logoSekolah from "../../assets/logo74.png";
import API from "../../services/api";
import {
  Newspaper,
  Search,
  Calendar,
  ChevronRight,
  ChevronDown,
  X,
  Menu,
  Sparkles,
  BookOpen,
  Globe,
  CheckCircle,
  Users,
  LayoutDashboard,
  User,
  LogIn,
  AlertCircle,
  Instagram,
  Youtube,
  Video,
} from "lucide-react";

export default function NewsInfo({
  user,
  onBackToHome,
  onGoToCatalog,
  onGoToDashboard,
  onOpenLogin,
}) {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedNews, setSelectedNews] = useState(null);

  // State Navigasi Navbar Mobile & Dropdown Layanan
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLayananOpen, setIsLayananOpen] = useState(false);

  // --- STATE PAGINASI (MAX 6 BERITA PER HALAMAN) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State Pop-up Notifikasi Layanan
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const categories = [
    "Semua",
    "Kegiatan",
    "Pengumuman",
    "Layanan",
    "Fasilitas",
  ];

  // Fetch data dari API Backend
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/news");
      if (res.data.success && res.data.data.length > 0) {
        setNewsList(res.data.data);
      } else {
        setNewsList(dummyNews);
      }
    } catch (err) {
      console.error("Gagal mengambil data berita:", err);
      setNewsList(dummyNews);
    } finally {
      setLoading(false);
    }
  };

  // Reset ke halaman 1 setiap kali filter pencarian atau kategori berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Data Dummy Fallback
  const dummyNews = [
    {
      id: 1,
      date: "15 September 2026",
      title: "Gerakan Literasi Digital SMKN 74 Tahun 2026",
      excerpt:
        "Perpustakaan menggalakkan program membaca e-book 15 menit sebelum KBM dimulai untuk meningkatkan minat baca siswa.",
      content:
        "Dalam rangka meningkatkan budaya membaca di lingkungan sekolah, Perpustakaan SMKN 74 Jakarta meluncurkan program Gerakan Literasi Digital 2026. Program ini mewajibkan seluruh siswa membaca e-book melalui repositori sekolah selama 15 menit sebelum kegiatan belajar mengajar (KBM) dimulai.",
      category: "Kegiatan",
      author: "Tim Pustakawan",
    },
    {
      id: 2,
      date: "28 Agustus 2026",
      title: "Penambahan Modul Pembelajaran Kejuruan Terbaru",
      excerpt:
        "Koleksi modul Seni Tari dan Karawitan edisi 2026 kini telah siap diakses siswa secara digital.",
      content:
        "Perpustakaan SMKN 74 telah menambah 50 judul modul digital terbaru untuk jurusan Seni Pertunjukan, meliputi Seni Tari, Seni Karawitan, Seni Teater, dan Seni Musik Barat.",
      category: "Pengumuman",
      author: "Kurikulum & Pustaka",
    },
    {
      id: 3,
      date: "10 Agustus 2026",
      title: "Sosialisasi Layanan Bebas Pustaka Online Kelas XII",
      excerpt:
        "Permohonan bebas pinjam buku untuk syarat kelulusan kini dapat diajukan secara daring melalui portal.",
      content:
        "Bagi siswa-siswi Kelas XII yang akan menyelesaikan studi, pengurusan Surat Keterangan Bebas Pustaka kini tidak perlu mengantre di perpustakaan fisik.",
      category: "Layanan",
      author: "Administrasi Pustaka",
    },
    {
      id: 4,
      date: "05 Agustus 2026",
      title: "Pemberian Penghargaan Pemustaka Teraktif Bulan Ini",
      excerpt:
        "Apresiasi bagi siswa-siswi yang paling rajin meminjam dan membaca koleksi buku perpustakaan.",
      content:
        "Perpustakaan memberikan penghargaan 'Pemustaka Teraktif' periode Agustus 2026 kepada 3 siswa terbaik dari jurusan Seni Musik dan Seni Teater.",
      category: "Kegiatan",
      author: "Kepala Perpustakaan",
    },
    {
      id: 5,
      date: "20 Juli 2026",
      title: "Pembaruan Fasilitas Ruang Baca Karawitan dan Seni Teater",
      excerpt:
        "Ruang baca kini dilengkapi audio player pendukung latihan seni musik dan dialog teater.",
      content:
        "Dalam rangka memberikan kenyamanan ekstra, area ruang baca lantai 2 perpustakaan kini dilengkapi fasilitas audio headset individual dan meja diskusi kelompok.",
      category: "Fasilitas",
      author: "Sarana & Prasarana",
    },
    {
      id: 6,
      date: "12 Juli 2026",
      title: "Workshop Pengolahan Arsip Digital Karya Seni Pertunjukan",
      excerpt:
        "Pelatihan dokumentasi naskah drama dan koreografi tari berbasis media digital bagi pengurus ekskul.",
      content:
        "Perpustakaan bekerja sama dengan ekstrakurikuler kesenian menyelenggarakan workshop digitalisasi arsip karya.",
      category: "Pengumuman",
      author: "Tim IT Perpustakaan",
    },
    {
      id: 7,
      date: "01 Juli 2026",
      title: "Layanan Koleksi Referensi Digital Semester Ganjil",
      excerpt:
        "Pembaruan katalog dan jurnal pembelajaran untuk mendukung tahun ajaran baru.",
      content:
        "Memasuki tahun ajaran baru, perpustakaan menambah katalog referensi digital yang bisa diakses secara langsung oleh pemustaka terdaftar.",
      category: "Layanan",
      author: "Layanan Pemustaka",
    },
  ];

  // Filter Berita Berdasarkan Kategori dan Pencarian
  const filteredNews = newsList.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- LOGIKA PERHITUNGAN PAGINASI ---
  const totalNews = filteredNews.length;
  const totalPages = Math.ceil(totalNews / itemsPerPage);

  const indexOfLastNews = currentPage * itemsPerPage;
  const indexOfFirstNews = indexOfLastNews - itemsPerPage;
  const currentNewsList = filteredNews.slice(indexOfFirstNews, indexOfLastNews);

  const startResult = totalNews === 0 ? 0 : indexOfFirstNews + 1;
  const endResult = Math.min(indexOfLastNews, totalNews);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg-main)] text-slate-800 flex flex-col justify-between">
      <div>
        {/* 1. TOP NAVBAR */}
        <header className="bg-[var(--color-brand-primary)] text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            {/* LOGO & JUDUL */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={onBackToHome}
            >
              <img
                src={logoSekolah}
                alt="Logo SMKN 74"
                className="h-10 w-auto object-contain"
              />
              <div>
                <span className="font-heading font-bold text-base sm:text-lg tracking-wide block leading-none">
                  SMK NEGERI 74
                </span>
                <span className="text-[10px] sm:text-xs text-amber-500 tracking-widest uppercase font-medium">
                  Perpustakaan Digital
                </span>
              </div>
            </div>

            {/* NAVIGASI MENU UTAMA DESKTOP */}
            <nav className="hidden md:flex items-center space-x-8 text-base font-medium text-slate-300">
              <button
                type="button"
                onClick={onBackToHome}
                className="cursor-pointer transition pb-1 flex items-center hover:text-amber-500"
              >
                Beranda
              </button>

              <button
                type="button"
                onClick={onGoToCatalog || onBackToHome}
                className="cursor-pointer transition pb-1 flex items-center hover:text-amber-500"
              >
                Katalog OPAC
              </button>

              {/* DROPDOWN MENU LAYANAN DESKTOP */}
              <div
                className="relative group py-2 flex items-center"
                onMouseEnter={() => setIsLayananOpen(true)}
                onMouseLeave={() => setIsLayananOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsLayananOpen(!isLayananOpen)}
                  className="flex items-center gap-1 hover:text-amber-500 transition cursor-pointer pb-1"
                >
                  <span>Layanan</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isLayananOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>

                {/* ISI DROPDOWN MENU DESKTOP */}
                {isLayananOpen && (
                  <div className="absolute top-full left-0 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLayananOpen(false);
                        if (onGoToCatalog) onGoToCatalog();
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                          Katalog Online (OPAC)
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Cari buku fisik & lokasi rak
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLayananOpen(false);
                        if (onBackToHome) onBackToHome();
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-slate-950 transition">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                          Buku Digital / Modul
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Akses modul kejuruan digital
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLayananOpen(false);
                        setAlertModal({
                          isOpen: true,
                          title: "Layanan Bebas Pustaka",
                          message:
                            "Layanan pengajuan Surat Bebas Pinjam Buku online untuk Kelas XII.",
                        });
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                          Bebas Pustaka
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Permohonan surat bebas pinjam
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLayananOpen(false);
                        setAlertModal({
                          isOpen: true,
                          title: "Info Keanggotaan",
                          message:
                            "Informasi ketentuan kartu anggota, hak pinjam, dan tata tertib perpustakaan.",
                        });
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500 group-hover:text-slate-950 transition">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-purple-400 transition">
                          Keanggotaan
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Info kartu & hak akses pemustaka
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="text-amber-500 font-bold border-b-2 border-amber-500 transition pb-1 flex items-center cursor-pointer"
              >
                Berita & Info
              </button>
            </nav>

            {/* ACTION BUTTON DESKTOP */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                user.role === "admin" || user.role === "pustakawan" ? (
                  <button
                    onClick={onGoToDashboard}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md flex items-center cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                    Admin
                  </button>
                ) : (
                  <button
                    onClick={onGoToDashboard}
                    className="bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 px-4 py-2 rounded-2xl transition flex items-center space-x-2.5 cursor-pointer shadow-md"
                  >
                    <div className="w-7 h-7 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/30">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">
                      My Dashboard
                    </span>
                  </button>
                )
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md flex items-center cursor-pointer gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
              )}
            </div>

            {/* TOMBOL HAMBURGER MOBILE */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* DROPDOWN MENU MOBILE */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onBackToHome) onBackToHome();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Beranda
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onGoToCatalog) onGoToCatalog();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Katalog OPAC
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onBackToHome) onBackToHome();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Layanan Perpustakaan
              </button>

              <button
                type="button"
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                Berita & Info
              </button>

              {/* DASHBOARD / LOGIN BUTTON MOBILE */}
              <div className="pt-2 border-t border-slate-800">
                {user ? (
                  user.role === "admin" || user.role === "pustakawan" ? (
                    <button
                      onClick={() => {
                        if (onGoToDashboard) onGoToDashboard();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onGoToDashboard) onGoToDashboard();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-amber-500 text-slate-950 text-xs font-extrabold px-4 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      My Dashboard
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      if (onOpenLogin) onOpenLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* 2. HEADER BANNER */}
        <div className="bg-[var(--color-brand-primary)] text-white py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-3">
            <span className="text-amber-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 inline-flex items-center gap-1.5 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Pusat Informasi Literasi
            </span>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading text-white leading-tight">
              Berita & Kabar Perpustakaan
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed">
              Dapatkan informasi terbaru seputar kegiatan literasi, modul
              kejuruan, pengumuman layanan, dan perkembangan perpustakaan SMKN
              74 Jakarta.
            </p>
          </div>
        </div>

        {/* 3. KONTEN UTAMA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          {/* Bar Search & Filter Kategori */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tabs Kategori */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Form Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Cari judul berita..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 font-medium focus:outline-none focus:border-amber-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Informational Count Status */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {startResult} - {endResult} dari {totalNews} Berita
            </p>
          </div>

          {/* Grid Daftar Berita */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Memuat daftar berita...
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2">
              <Newspaper className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">
                Tidak ada berita ditemukan
              </p>
              <p className="text-xs">
                Coba kata kunci lain atau ganti pilihan filter kategori.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentNewsList.map((news) => (
                  <div
                    key={news.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div className="p-5 space-y-4">
                      {/* Thumbnail */}
                      <div className="h-44 bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center text-slate-400 border border-slate-200/50">
                        {news.image ? (
                          <img
                            src={
                              news.image.startsWith("http")
                                ? news.image
                                : `http://localhost:5000/uploads/${news.image}`
                            }
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <Newspaper className="w-10 h-10 text-slate-300" />
                        )}

                        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs">
                          {news.category || "Berita"}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {news.date ||
                            (news.created_at
                              ? new Date(news.created_at).toLocaleDateString(
                                  "id-ID",
                                )
                              : "Terbaru")}
                        </span>
                      </div>

                      {/* Judul & Excerpt */}
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition line-clamp-2">
                        {news.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {news.excerpt || news.content}
                      </p>
                    </div>

                    {/* Footer Card */}
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedNews(news)}
                        className="w-full bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Baca Selengkapnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* NAVIGASI PAGINASI (TEMA AMBER) */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          currentPage === page
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                            : "bg-white text-amber-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`px-3.5 h-9 sm:h-10 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                      currentPage === totalPages
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white text-amber-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                    }`}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`px-3.5 h-9 sm:h-10 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      currentPage === totalPages
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white text-amber-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                    }`}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. FOOTER SECTION */}
      <footer className="w-full bg-[var(--color-brand-primary,#0b1329)] text-slate-300 pt-10 sm:pt-14 pb-8 border-t border-slate-800 font-sans mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800/80">
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

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-amber-400 border border-amber-500/30 rounded-md tracking-wider uppercase bg-amber-500/10">
                  PERPUSTAKAAN SEKOLAH
                </span>

                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-slate-300 border border-slate-700 rounded-md tracking-wider uppercase bg-slate-900/40">
                  PEMPROV DKI JAKARTA
                </span>
              </div>
            </div>

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

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
            <p>© 2026 Perpustakaan SMKN 74 Jakarta. All rights reserved.</p>

            <div className="flex items-center space-x-3">
              <a
                href="https://www.instagram.com/smkn74jkt"
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

      {/* MODAL POPUP DETAIL BERITA */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 space-y-6">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-full">
                  {selectedNews.category || "Berita"}
                </span>
                <span className="text-xs text-slate-400">
                  •{" "}
                  {selectedNews.date || new Date().toLocaleDateString("id-ID")}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-snug">
                {selectedNews.title}
              </h2>
            </div>

            {/* Gambar Besar jika ada */}
            {selectedNews.image && (
              <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                <img
                  src={
                    selectedNews.image.startsWith("http")
                      ? selectedNews.image
                      : `http://localhost:5000/uploads/${selectedNews.image}`
                  }
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Isi Konten Berita */}
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4 border-t border-slate-100 pt-4">
              <p>{selectedNews.content || selectedNews.excerpt}</p>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition cursor-pointer"
              >
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI INFORMASI LAYANAN */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner bg-amber-100 text-amber-600">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                {alertModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {alertModal.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setAlertModal({ isOpen: false, title: "", message: "" })
              }
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
