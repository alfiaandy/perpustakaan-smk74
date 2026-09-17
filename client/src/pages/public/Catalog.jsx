import React, { useState, useEffect } from "react";
import logoSekolah from "../../assets/logo74.png";
import API from "../../services/api";
import Home from "./Home";
import {
  Search,
  CheckCircle,
  User,
  LogIn,
  LayoutDashboard,
  X,
  Menu,
  AlertCircle,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Instagram,
  Youtube,
  Video,
  Globe,
  Users,
} from "lucide-react";

export default function Catalog({
  user,
  onLogout,
  onGoToDashboard,
  onOpenLogin,
}) {
  // State Navigasi Tab (Beranda vs Katalog OPAC)
  const [activeTab, setActiveTab] = useState("home");

  // State Navigasi Menu Mobile Hamburger
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State untuk Dropdown Menu Layanan (Desktop)
  const [isLayananOpen, setIsLayananOpen] = useState(false);

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  // --- STATE PAGINASI (MAX 10 BUKU PER HALAMAN) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State Pop-up Detail Buku
  const [selectedBook, setSelectedBook] = useState(null);

  // State untuk kontrol ekspansi Sinopsis Panjang pada Modal Detail
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  // State Form Booking Peminjaman Buku
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    book: null,
    maxTakeDate: "",
  });

  // State Pop-up Box Notifikasi (Sukses / Error)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false,
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/books?search=${search}&category=${category}&sortBy=${sortBy}`,
      );
      setBooks(res.data.data || []);
      setCurrentPage(1); // Reset ke halaman 1 setiap kali filter berubah
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "catalog") {
      fetchBooks();
    }
  }, [search, category, sortBy, activeTab]);

  // --- LOGIKA PERHITUNGAN PAGINASI ---
  const totalBooks = books.length;
  const totalPages = Math.ceil(totalBooks / itemsPerPage);

  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const startResult = totalBooks === 0 ? 0 : indexOfFirstBook + 1;
  const endResult = Math.min(indexOfLastBook, totalBooks);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleOpenBookingForm = (book) => {
    if (!user) {
      setAlertModal({
        isOpen: true,
        title: "Akses Ditolak",
        message: "Silakan login terlebih dahulu untuk melakukan booking buku!",
        isError: true,
      });
      return;
    }

    const today = new Date();
    today.setDate(today.getDate() + 7);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedH7Date = `${year}-${month}-${day}`;

    setSelectedBook(null);
    setIsSynopsisExpanded(false);
    setBookingModal({
      isOpen: true,
      book: book,
      maxTakeDate: formattedH7Date,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingModal.book) return;

    setRequestLoading(true);
    try {
      const res = await API.post("/loans/request", {
        book_id: bookingModal.book.id,
        max_take_date: bookingModal.maxTakeDate,
      });

      if (res.data.success) {
        setBookingModal({ isOpen: false, book: null, maxTakeDate: "" });
        setAlertModal({
          isOpen: true,
          title: "Booking Berhasil!",
          message: res.data.message,
          isError: false,
        });
        fetchBooks();
      }
    } catch (err) {
      setBookingModal({ isOpen: false, book: null, maxTakeDate: "" });
      setAlertModal({
        isOpen: true,
        title: "Gagal Booking",
        message:
          err.response?.data?.message || "Terjadi kesalahan pada sistem.",
        isError: true,
      });
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-slate-800 relative flex flex-col justify-between">
      <div>
        {/* 1. TOP NAVBAR */}
        <header className="bg-[var(--color-brand-primary)] text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            {/* LOGO & JUDUL */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                setActiveTab("home");
                setIsMobileMenuOpen(false);
              }}
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
                onClick={() => setActiveTab("home")}
                className={`cursor-pointer transition pb-1 flex items-center ${
                  activeTab === "home"
                    ? "text-amber-500 font-bold border-b-2 border-amber-500"
                    : "hover:text-amber-500"
                }`}
              >
                Beranda
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={`cursor-pointer transition pb-1 flex items-center ${
                  activeTab === "catalog"
                    ? "text-amber-500 font-bold border-b-2 border-amber-500"
                    : "hover:text-amber-500"
                }`}
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
                        setActiveTab("catalog");
                        setIsLayananOpen(false);
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
                        setActiveTab("home");
                        setIsLayananOpen(false);
                        setTimeout(() => {
                          const el = document.getElementById("layanan");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
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
                          isError: false,
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
                          isError: false,
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

              <a
                href="#footer"
                className="flex items-center cursor-pointer transition pb-1 hover:text-amber-500"
              >
                Berita & Info
              </a>
            </nav>

            {/* ACTION BUTTON DESKTOP (Hidden di Mobile) */}
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

            {/* TOMBOL HAMBURGER MOBILE (Hanya Tampil di Layar Kecil) */}
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
                  setActiveTab("home");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === "home"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Beranda
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("catalog");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === "catalog"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Katalog OPAC
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("home");
                  setIsMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById("layanan");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Layanan Perpustakaan
              </button>

              <a
                href="#footer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Berita & Info
              </a>

              {/* DASHBOARD / LOGIN BUTTON DALAM MENU MOBILE */}
              <div className="pt-2 border-t border-slate-800">
                {user ? (
                  user.role === "admin" || user.role === "pustakawan" ? (
                    <button
                      onClick={() => {
                        onGoToDashboard();
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
                        onGoToDashboard();
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
                      onOpenLogin();
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

        {/* RENDER KONTEN BERDASARKAN TAB YANG AKTIF */}
        {activeTab === "home" ? (
          <main className="w-full">
            <Home onNavigateToCatalog={() => setActiveTab("catalog")} />
          </main>
        ) : (
          <>
            {/* 2. HERO SEARCH SECTION (OPAC) */}
            <section className="bg-[var(--color-brand-primary)] text-white py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <span className="text-amber-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 inline-block bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                  Layanan Literasi Digital SMKN 74
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-3 sm:mb-4 leading-tight">
                  Eksplorasi Ilmu & Referensi Seni Pertunjukan
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-6 sm:mb-8 font-normal">
                  Temukan koleksi naskah, modul pembelajaran kejuruan, dan
                  literatur umum secara instan.
                </p>

                <div className="max-w-3xl mx-auto relative">
                  <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-700 gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl border-none focus:outline-none cursor-pointer w-full md:w-auto"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="Seni Tari">Seni Tari</option>
                      <option value="Seni Karawitan">Seni Karawitan</option>
                      <option value="Seni Musik">Seni Musik</option>
                      <option value="Seni Teater">Seni Teater</option>
                      <option value="Umum">Umum / Akademik</option>
                    </select>

                    <div className="flex-1 flex items-center w-full">
                      <Search className="w-5 h-5 text-slate-400 ml-2 mr-2" />
                      <input
                        type="text"
                        placeholder="Cari judul buku, penulis, ISBN..."
                        className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none py-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl border-none focus:outline-none cursor-pointer w-full md:w-auto"
                    >
                      <option value="latest">Terbaru</option>
                      <option value="title-asc">Judul (A-Z)</option>
                      <option value="popular">Terpopuler</option>
                    </select>

                    <button
                      onClick={fetchBooks}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-3 rounded-xl transition cursor-pointer w-full md:w-auto"
                    >
                      Cari
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. CATALOG LIST SECTION */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-slate-500 font-medium">
                  Showing {startResult} - {endResult} of {totalBooks} Results
                </p>
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-500 text-sm">
                  Memuat katalog buku...
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {currentBooks.length > 0 ? (
                    currentBooks.map((book) => {
                      const availableStock =
                        book.available_stock ?? book.total_stock ?? 0;
                      const isAvailable = availableStock > 0;
                      const categoryName =
                        book.category_name || book.category || "Umum";

                      return (
                        <div
                          key={book.id}
                          onClick={() => {
                            setSelectedBook(book);
                            setIsSynopsisExpanded(false);
                          }}
                          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex flex-col md:flex-row gap-4 sm:gap-6 cursor-pointer relative"
                        >
                          {/* DISPLAY SAMPUL FOTO BUKU */}
                          <div className="w-28 h-38 sm:w-32 sm:h-44 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200/80 overflow-hidden mx-auto md:mx-0">
                            {book.cover_image ? (
                              <img
                                src={`http://localhost:5000/uploads/${book.cover_image}`}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-10 h-10 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug hover:underline">
                                {book.title}
                              </h3>

                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                                  isAvailable
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-rose-100 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {isAvailable
                                  ? `Tersedia (${availableStock})`
                                  : "Stok Habis"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              👤 {book.author}
                            </p>
                            <p className="text-xs text-slate-500">
                              Klasifikasi: {categoryName}
                            </p>
                            <p className="text-xs text-amber-600 font-semibold">
                              {book.publisher || "PT Visimedia Pustaka"} -{" "}
                              {book.year_published || "2019"} - ISBN:{" "}
                              {book.isbn || "-"}
                            </p>
                            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                              Kode Buku : {book.id} | Subjek : {categoryName} |
                              Eksemplar : {availableStock} | Tersimpan di
                              Perpustakaan SMKN 74
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                      Buku yang kamu cari tidak ditemukan.
                    </div>
                  )}

                  {/* NAVIGASI PAGINASI (TEMA AMBER) */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-8 sm:pt-10">
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
            </section>

            {/* 6. FOOTER SECTION KHUSUS HALAMAN OPAC KATALOG */}
            <footer
              id="footer"
              className="w-full bg-[var(--color-brand-primary,#0b1329)] text-slate-300 pt-10 sm:pt-14 pb-8 border-t border-slate-800 font-sans mt-12 sm:mt-20"
            >
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
                  <p>
                    © 2026 Perpustakaan SMKN 74 Jakarta. All rights reserved.
                  </p>
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
          </>
        )}
      </div>

      {/* 4. MODAL DETAIL BUKU */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col justify-between">
            <button
              onClick={() => {
                setSelectedBook(null);
                setIsSynopsisExpanded(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 overflow-y-auto overscroll-contain pr-1">
              <div className="w-32 h-48 sm:w-36 sm:h-52 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden self-center md:self-start sticky top-0">
                {selectedBook.cover_image ? (
                  <img
                    src={`http://localhost:5000/uploads/${selectedBook.cover_image}`}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-snug">
                  {selectedBook.title}
                </h2>

                <p className="text-xs text-slate-600 font-medium">
                  👤 {selectedBook.author} •{" "}
                  {selectedBook.publisher || "PT Visimedia Pustaka"} •{" "}
                  {selectedBook.year_published || "2019"} • ISBN:{" "}
                  {selectedBook.isbn || "-"}
                </p>

                <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    — Sinopsis
                  </p>
                  <p
                    className={`text-xs text-slate-600 leading-relaxed transition-all ${
                      !isSynopsisExpanded ? "line-clamp-3" : ""
                    }`}
                  >
                    {selectedBook.description ||
                      "Buku ini menyajikan modul dan materi pembelajaran praktis bagi siswa SMK untuk menambah referensi literasi."}
                  </p>

                  {selectedBook.description &&
                    selectedBook.description.length > 120 && (
                      <button
                        type="button"
                        onClick={() =>
                          setIsSynopsisExpanded(!isSynopsisExpanded)
                        }
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline pt-1 transition cursor-pointer block"
                      >
                        {isSynopsisExpanded
                          ? "▲ Sembunyikan Ringkasan"
                          : "▼ Baca Selengkapnya"}
                      </button>
                    )}
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    — Kategori Buku
                  </p>
                  <span className="inline-block bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md mt-1 uppercase tracking-wider">
                    {selectedBook.category_name ||
                      selectedBook.category ||
                      "UMUM"}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    — Tersedia di Perpustakaan:
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    Perpustakaan SMKN 74 (Rak{" "}
                    {selectedBook.rack_location || "A-01"})
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleOpenBookingForm(selectedBook)}
                disabled={
                  (selectedBook.available_stock ?? selectedBook.total_stock) <=
                  0
                }
                className={`font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer uppercase tracking-wider shadow-md ${
                  (selectedBook.available_stock ?? selectedBook.total_stock) > 0
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                }`}
              >
                <BookOpen className="w-4 h-4" />{" "}
                {(selectedBook.available_stock ?? selectedBook.total_stock) > 0
                  ? "PINJAM BUKU"
                  : "STOK HABIS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL FORM PEMINJAMAN BUKU (BOOKING) */}
      {bookingModal.isOpen && bookingModal.book && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() =>
                setBookingModal({ isOpen: false, book: null, maxTakeDate: "" })
              }
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-800" />
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Form Peminjaman Buku
              </h3>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Judul Buku
                </label>
                <input
                  type="text"
                  readOnly
                  value={bookingModal.book.title}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Penulis
                </label>
                <input
                  type="text"
                  readOnly
                  value={bookingModal.book.author}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Maksimal Ambil (H+7)
                </label>
                <input
                  type="text"
                  readOnly
                  value={bookingModal.maxTakeDate}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-600 mb-1">
                  Perpustakaan
                </label>
                <input
                  type="text"
                  readOnly
                  value="Perpustakaan Utama SMKN 74"
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-800 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-amber-200 cursor-pointer"
                >
                  {requestLoading ? "Memproses..." : "Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL NOTIFIKASI */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative text-center space-y-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
                alertModal.isError
                  ? "bg-rose-100 text-rose-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {alertModal.isError ? (
                <AlertCircle className="w-7 h-7" />
              ) : (
                <CheckCircle className="w-7 h-7" />
              )}
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
                setAlertModal({
                  isOpen: false,
                  title: "",
                  message: "",
                  isError: false,
                })
              }
              className={`w-full py-3 text-white font-semibold rounded-xl text-xs transition shadow-md cursor-pointer ${
                alertModal.isError
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
