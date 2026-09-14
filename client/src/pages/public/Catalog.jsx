import React, { useState, useEffect } from "react";
import logoSekolah from "../../assets/logo74.png";
import API from "../../services/api";
import {
  Search,
  CheckCircle,
  User,
  LogIn,
  LayoutDashboard,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export default function Catalog({
  user,
  onLogout,
  onGoToDashboard,
  onOpenLogin,
}) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  // State Pop-up Detail Buku
  const [selectedBook, setSelectedBook] = useState(null);

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
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, category, sortBy]);

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

    // Kalkulasi H+7 dari tanggal booking
    const today = new Date();
    today.setDate(today.getDate() + 7);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedH7Date = `${year}-${month}-${day}`;

    setSelectedBook(null);
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
    <div className="min-h-screen bg-[var(--color-bg-main)] text-slate-800 relative">
      {/* 1. TOP NAVBAR */}
      <header className="bg-[var(--color-brand-primary)] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={logoSekolah}
              alt="Logo SMKN 74"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="font-heading font-bold text-lg tracking-wide block leading-none">
                SMK NEGERI 74
              </span>
              <span className="text-[10px] text-amber-500 tracking-widest uppercase font-medium">
                Perpustakaan Digital
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a
              href="#"
              className="text-amber-500 font-semibold border-b-2 border-amber-500 pb-1"
            >
              Katalog OPAC
            </a>
            <a href="#" className="hover:text-amber-500 transition">
              Layanan
            </a>
            <a href="#" className="hover:text-amber-500 transition">
              Panduan
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              user.role === "admin" || user.role === "pustakawan" ? (
                <button
                  onClick={onGoToDashboard}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-md flex items-center cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard Admin
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
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-[var(--color-brand-primary)] text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3 inline-block bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
            Layanan Literasi Digital SMKN 74
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 leading-tight">
            Eksplorasi Ilmu & Referensi Seni Pertunjukan
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-8 font-normal">
            Temukan koleksi naskah, modul pembelajaran kejuruan, dan literatur
            umum secara instan.
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
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-500 font-medium">
            Showing 1 - {books.length} of {books.length} Results
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">
            Memuat katalog buku...
          </div>
        ) : (
          <div className="space-y-6">
            {books.length > 0 ? (
              books.map((book) => {
                const availableStock =
                  book.available_stock ?? book.total_stock ?? 0;
                const isAvailable = availableStock > 0;
                // Ambil nama kategori dinamis dari DB atau fallback
                const categoryName =
                  book.category_name || book.category || "Umum";

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex flex-col md:flex-row gap-6 cursor-pointer relative"
                  >
                    {/* DISPLAY SAMPUL FOTO BUKU */}
                    <div className="w-32 h-44 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200/80 overflow-hidden">
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
                        <h3 className="text-xl font-bold font-heading text-slate-900 leading-snug hover:underline">
                          {book.title}
                        </h3>

                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
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
                      <p className="text-xs text-emerald-600 font-semibold">
                        {book.publisher || "PT Visimedia Pustaka"} -{" "}
                        {book.year_published || "2019"} - ISBN:{" "}
                        {book.isbn || "-"}
                      </p>
                      <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                        Kode Buku : {book.id} | Subjek : {categoryName} |
                        Eksemplar : {availableStock} | Tersimpan di Perpustakaan
                        SMKN 74
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                Buku yang kamu cari tidak ditemukan.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. MODAL DETAIL BUKU */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-40 h-56 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
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
                <h2 className="text-2xl font-bold font-heading text-slate-900 leading-snug">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  👤 {selectedBook.author} •{" "}
                  {selectedBook.publisher || "PT Visimedia Pustaka"} •{" "}
                  {selectedBook.year_published || "2019"} •{" "}
                  {selectedBook.isbn || "-"}
                </p>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">— Sinopsis</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedBook.description ||
                      "Buku ini menyajikan modul dan materi pembelajaran praktis bagi siswa SMK untuk menambah referensi literasi."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    — Kategori Buku
                  </p>
                  <span className="inline-block bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase">
                    {selectedBook.category_name ||
                      selectedBook.category ||
                      "UMUM"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    — Tersedia di Perpustakaan:
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    Perpustakaan SMKN 74 (Rak{" "}
                    {selectedBook.rack_location || "A-1"})
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleOpenBookingForm(selectedBook)}
                    disabled={
                      (selectedBook.available_stock ??
                        selectedBook.total_stock) <= 0
                    }
                    className={`font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer uppercase tracking-wider shadow-md ${
                      (selectedBook.available_stock ??
                        selectedBook.total_stock) > 0
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />{" "}
                    {(selectedBook.available_stock ??
                      selectedBook.total_stock) > 0
                      ? "PINJAM BUKU"
                      : "STOK HABIS"}
                  </button>
                </div>
              </div>
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
                <label className="block text-xs font-semibold text-emerald-600 mb-1">
                  Perpustakaan
                </label>
                <input
                  type="text"
                  readOnly
                  value="Perpustakaan Utama SMKN 74"
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-800 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-sky-200 cursor-pointer"
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
