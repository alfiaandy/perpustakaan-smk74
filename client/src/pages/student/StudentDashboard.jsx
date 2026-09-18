import React, { useState, useEffect } from "react";
import logo74 from "../../assets/logo74.png";
import API from "../../services/api";
import StudentCard from "./StudentCard";
import {
  User,
  LogOut,
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookmarkCheck,
  Loader2,
  CreditCard,
} from "lucide-react";

export default function StudentDashboard({ user, onLogout, onGoToCatalog }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mengambil data riwayat peminjaman siswa yang sedang login
  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/loans/my-loans");
      if (res.data.success) {
        setLoans(res.data.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat peminjaman:", err);
      setError(
        err.response?.data?.message || "Gagal memuat data peminjaman Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  // Hitung statistik peminjaman (Mendukung format status dari MySQL)
  const totalBooking = loans.filter(
    (item) =>
      item.status === "booking" || item.status === "menunggu_konfirmasi",
  ).length;

  const totalDipinjam = loans.filter(
    (item) => item.status === "dipinjam" || item.status === "borrowed",
  ).length;

  const totalSelesai = loans.filter(
    (item) => item.status === "dikembalikan" || item.status === "returned",
  ).length;

  // Helper badge warna status
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "booking":
      case "menunggu_konfirmasi":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> Menunggu Diambil
          </span>
        );
      case "dipinjam":
      case "borrowed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Sedang Dipinjam
          </span>
        );
      case "dikembalikan":
      case "returned":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Dikembalikan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 1. TOP NAVBAR DASHBOARD SISWA */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={logo74}
              alt="Logo SMKN 74"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="font-heading font-bold text-lg tracking-wide block leading-none">
                SMK NEGERI 74
              </span>
              <span className="text-xs text-amber-500 tracking-widest uppercase font-medium">
                Dashboard Siswa
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onGoToCatalog}
              className="inline-flex items-center text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl transition border border-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Katalog
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* PROFILE BANNER */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-slate-900">
                {user?.full_name || user?.name || "Nama Siswa"}
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <span>
                  NISN:{" "}
                  <strong className="text-slate-700">
                    {user?.username || user?.nisn}
                  </strong>
                </span>
                <span>•</span>
                <span className="capitalize text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                  {user?.role || "Siswa"}
                </span>
              </p>
            </div>
          </div>

          {/* TOMBOL LOGOUT UTAMA SISWA */}
          <button
            onClick={onLogout}
            className="w-full md:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm px-5 py-3 rounded-xl transition border border-rose-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>

        {/* SECTION KARTU ANGGOTA PERPUSTAKAAN DIGITAL */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Kartu Anggota Digital Siswa
            </h2>
          </div>
          <StudentCard user={user} />
        </div>

        {/* STATISTIK CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Menunggu Diambil
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {totalBooking}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Sedang Dipinjam
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {totalDipinjam}
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center border border-sky-100">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Selesai / Dikembalikan
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {totalSelesai}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TABEL RIWAYAT PEMINJAMAN SISWA */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookmarkCheck className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Daftar Peminjaman & Booking Saya
              </h2>
            </div>
            <button
              onClick={fetchMyLoans}
              className="text-sm font-semibold text-amber-600 hover:underline cursor-pointer"
            >
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span className="text-sm font-medium">
                Memuat data peminjaman...
              </span>
            </div>
          ) : loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider text-xs">
                    <th className="p-4 pl-6">Judul Buku</th>
                    <th className="p-4">Tanggal Booking</th>
                    <th className="p-4">Maksimal Ambil (H+7)</th>
                    <th className="p-4">Tanggal Pinjam</th>
                    <th className="p-4">Tanggal Kembali</th>
                    <th className="p-4 pr-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loans.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-900">
                        {item.book_title || item.title || "Buku Perpustakaan"}
                      </td>
                      <td className="p-4">
                        {item.booking_date
                          ? new Date(item.booking_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td className="p-4 font-semibold text-amber-700">
                        {item.max_take_date
                          ? new Date(item.max_take_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td className="p-4">
                        {item.borrow_date
                          ? new Date(item.borrow_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td className="p-4">
                        {item.return_date
                          ? new Date(item.return_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm">
                Anda belum memiliki riwayat booking atau peminjaman buku.
              </p>
              <button
                onClick={onGoToCatalog}
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cari & Pinjam Buku Sekarang
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
