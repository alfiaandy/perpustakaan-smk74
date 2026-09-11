import React, { useState, useEffect } from "react";
import logoSekolah from "../../assets/logo74.png";
import API from "../../services/api";
import {
  Search,
  CheckCircle,
  User,
  LogOut,
  LayoutDashboard,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export default function Catalog({ user, onLogout, onGoToDashboard }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
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
      const res = await API.get(`/books?search=${search}`);
      setBooks(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search]);

  // Buka Form Booking dari Modal Detail dengan kalkulasi H+2 presisi
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

    // Kalkulasi H+2 dari hari ini
    const today = new Date();
    today.setDate(today.getDate() + 2);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedH2Date = `${year}-${month}-${day}`;

    setSelectedBook(null); // Tutup modal detail
    setBookingModal({
      isOpen: true,
      book: book,
      maxTakeDate: formattedH2Date,
    });
  };

  // Submit Form Booking ke Backend
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
            {user && (
              <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-700/80">
                <div className="w-8 h-8 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/30">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-none">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-amber-500 capitalize mt-0.5">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            {user && (user.role === "admin" || user.role === "pustakawan") && (
              <button
                onClick={onGoToDashboard}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-md flex items-center cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
              </button>
            )}

            <button
              onClick={onLogout}
              className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-[var(--color-brand-primary)] text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3 inline-block bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
            Layanan Literasi Digital
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 leading-tight">
            Eksplorasi Ilmu & Referensi Belajar Siswa
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-8 font-normal">
            Temukan ribuan koleksi modul pembelajaran, buku kejuruan, dan
            literatur umum secara instan.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-700">
              <Search className="w-6 h-6 text-slate-400 ml-3 mr-2" />
              <input
                type="text"
                placeholder="Cari judul buku, penulis, atau nomor ISBN..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-3 rounded-xl transition cursor-pointer">
                Cari
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATALOG LIST SECTION (LAYOUT OPAC DATAR) */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <p className="text-xs text-slate-500 font-medium mb-6">
          Showing 1 - {books.length} of {books.length} Results
        </p>

        {loading ? (
          <div className="text-center py-20 text-slate-500">
            Memuat katalog buku...
          </div>
        ) : (
          <div className="space-y-6">
            {books.length > 0 ? (
              books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex flex-col md:flex-row gap-6 cursor-pointer"
                >
                  <div className="w-32 h-44 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200/80">
                    <BookOpen className="w-10 h-10 text-slate-400" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold font-heading text-slate-900 leading-snug hover:underline">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      👤 {book.author}
                    </p>
                    <p className="text-xs text-slate-500">
                      Klasifikasi: {book.category_name || "641.5"}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold">
                      {book.publisher || "PT Visimedia Pustaka"} -{" "}
                      {book.year_published || "2019"} - ISBN: {book.isbn || "-"}
                    </p>
                    <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                      Kode Buku : {book.id} | Subjek :{" "}
                      {book.category_name || "Umum"} | Eksemplar :{" "}
                      {book.available_stock ?? book.total_stock} | Tersimpan di
                      Perpustakaan SMKN 74
                    </p>
                  </div>
                </div>
              ))
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
              <div className="w-40 h-56 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-200">
                <BookOpen className="w-12 h-12 text-slate-400" />
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
                    — Kata Kunci
                  </p>
                  <span className="inline-block bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase">
                    {selectedBook.category_name || "MENU MASAKAN"}
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
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer uppercase tracking-wider shadow-md shadow-teal-200"
                  >
                    <BookOpen className="w-4 h-4" /> PINJAM BUKU
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
                  Maksimal Ambil
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
