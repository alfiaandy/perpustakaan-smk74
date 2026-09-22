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
  History,
  BookMarked,
  XCircle,
  Bookmark,
  QrCode,
  CalendarPlus,
  X,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

export default function StudentDashboard({
  user,
  setUser,
  onLogout,
  onGoToCatalog,
}) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'history'

  // Modal QR Code State
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    loanCode: "",
    bookTitle: "",
  });

  // Modal Konfirmasi Batal / Perpanjang
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "", // 'cancel' | 'extend'
    loanId: null,
  });

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

  const handleUserUpdated = (updatedUserData) => {
    if (setUser) setUser(updatedUserData);
  };

  // Eksekusi Batal Booking / Perpanjang Pinjaman
  const handleExecuteAction = async () => {
    const { type, loanId } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    try {
      if (type === "cancel") {
        const res = await API.put(`/loans/${loanId}/cancel`);
        if (res.data.success) {
          alert("Booking berhasil dibatalkan!");
          fetchMyLoans();
        }
      } else if (type === "extend") {
        const res = await API.put(`/loans/${loanId}/extend`);
        if (res.data.success) {
          alert("Peminjaman berhasil diperpanjang 7 hari!");
          fetchMyLoans();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses tindakan.");
    }
  };

  // Helper kalkulasi estimasi denda otomatis (Keterlambatan × Rp 1.000 / Hari)
  const calculateEstimatedFine = (dueDateStr, fineAmountFromDB) => {
    if (fineAmountFromDB && Number(fineAmountFromDB) > 0) {
      return Number(fineAmountFromDB);
    }
    if (!dueDateStr) return 0;

    const dueDate = new Date(dueDateStr);
    const today = new Date();

    // Hilangkan jam untuk akurasi hitungan hari
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const FINE_PER_DAY = 1000; // Tarik nilai per hari (Rp 1.000/hari)
      return diffDays * FINE_PER_DAY;
    }

    return 0;
  };

  // Filter Data Tab 1 (Aktif) dan Tab 2 (Histori)
  const activeLoans = loans.filter(
    (item) =>
      item.status === "booking" ||
      item.status === "menunggu_konfirmasi" ||
      item.status === "dipinjam" ||
      item.status === "borrowed",
  );

  const historyLoans = loans.filter(
    (item) =>
      item.status === "dikembalikan" ||
      item.status === "returned" ||
      item.status === "ditolak" ||
      item.status === "expired" ||
      item.status === "batal",
  );

  const displayedLoans = activeTab === "active" ? activeLoans : historyLoans;

  // Helper badge warna status + Label Warning Merah jika terlambat
  const getStatusBadge = (status, dueDate) => {
    const isOverdue =
      (status === "dipinjam" || status === "borrowed") &&
      dueDate &&
      new Date(dueDate) < new Date();

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white border border-rose-600 shadow-xs animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Terlambat (Warning)
        </span>
      );
    }

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
      case "ditolak":
      case "expired":
      case "batal":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Expired / Batal
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
      {/* HEADER NAVBAR */}
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
          <button
            onClick={onGoToCatalog}
            className="inline-flex items-center text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl transition border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Katalog
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* PROFILE BANNER & CARD */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-slate-900">
                {user?.full_name || "Nama Siswa"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                NISN:{" "}
                <strong className="text-slate-700">
                  {user?.username || user?.nisn}
                </strong>
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm px-5 py-3 rounded-xl transition border border-rose-200 flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar Akun
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-4">
          <StudentCard user={user} onUserUpdated={handleUserUpdated} />
        </div>

        {/* TABEL PEMINJAMAN DENGAN TAB & AKSIS */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-4 gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-2xl transition cursor-pointer border-b-2 ${
                activeTab === "active"
                  ? "border-amber-600 text-amber-600 bg-white shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Peminjaman & Booking Aktif</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
                {activeLoans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-2xl transition cursor-pointer border-b-2 ${
                activeTab === "history"
                  ? "border-amber-600 text-amber-600 bg-white shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histori Peminjaman</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {historyLoans.length}
              </span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span>Memuat data peminjaman...</span>
            </div>
          ) : displayedLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="p-4 pl-6">Judul Buku</th>
                    <th className="p-4">Tgl Booking / Pinjam</th>

                    {/* COLUMNS TAB 1 */}
                    {activeTab === "active" && (
                      <>
                        <th className="p-4">Batas Ambil (H+7)</th>
                        <th className="p-4">Jatuh Tempo Pinjam</th>
                        <th className="p-4">Estimasi Denda</th>
                      </>
                    )}

                    {/* COLUMNS TAB 2 (HISTORI) */}
                    {activeTab === "history" && (
                      <>
                        <th className="p-4">Tgl Pengembalian Riil</th>
                        <th className="p-4">Catatan Denda / Keterlambatan</th>
                      </>
                    )}

                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-center">Aksi / Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedLoans.map((item) => {
                    const isBooking =
                      item.status === "booking" ||
                      item.status === "menunggu_konfirmasi";
                    const isBorrowed =
                      item.status === "dipinjam" || item.status === "borrowed";

                    let computedDueDate = item.due_date;
                    if (
                      !computedDueDate &&
                      (item.borrow_date || item.loan_date)
                    ) {
                      const d = new Date(item.borrow_date || item.loan_date);
                      d.setDate(d.getDate() + 7);
                      computedDueDate = d;
                    }

                    // Estimasi Denda Otomatis untuk Tab Aktif
                    const estimatedFine = calculateEstimatedFine(
                      computedDueDate,
                      item.fine_amount,
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="p-4 pl-6 font-bold text-slate-900">
                          {item.book_title || item.title}
                        </td>
                        <td className="p-4">
                          {item.borrow_date || item.loan_date
                            ? new Date(
                                item.borrow_date || item.loan_date,
                              ).toLocaleDateString("id-ID")
                            : item.booking_date
                              ? new Date(item.booking_date).toLocaleDateString(
                                  "id-ID",
                                )
                              : "-"}
                        </td>

                        {/* TAMPILAN TAB 1 (AKTIF) */}
                        {activeTab === "active" && (
                          <>
                            <td className="p-4 font-semibold text-amber-700">
                              {isBooking && item.max_take_date
                                ? new Date(
                                    item.max_take_date,
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </td>
                            <td className="p-4 font-semibold text-slate-800">
                              {isBorrowed && computedDueDate
                                ? new Date(computedDueDate).toLocaleDateString(
                                    "id-ID",
                                  )
                                : "-"}
                            </td>
                            <td className="p-4 font-mono font-bold">
                              {isBorrowed && estimatedFine > 0 ? (
                                <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                                  Rp {estimatedFine.toLocaleString("id-ID")}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* TAMPILAN TAB 2 (HISTORI) */}
                        {activeTab === "history" && (
                          <>
                            <td className="p-4 font-medium text-slate-700">
                              {item.return_date
                                ? new Date(item.return_date).toLocaleDateString(
                                    "id-ID",
                                  )
                                : "-"}
                            </td>
                            <td className="p-4">
                              {item.fine_amount > 0 ? (
                                <div className="space-y-0.5">
                                  <span className="font-mono font-bold text-rose-600 block">
                                    Rp{" "}
                                    {Number(item.fine_amount).toLocaleString(
                                      "id-ID",
                                    )}
                                  </span>
                                  {item.late_days > 0 && (
                                    <span className="text-[10px] text-slate-400 block">
                                      Terlambat {item.late_days} hari
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-emerald-600 font-semibold text-[11px]">
                                  Tidak Ada Denda
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        <td className="p-4">
                          {getStatusBadge(item.status, computedDueDate)}
                        </td>

                        {/* AKSIS TOMBOL */}
                        <td className="p-4 pr-6 text-center">
                          {activeTab === "active" && isBooking && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  setQrModal({
                                    isOpen: true,
                                    loanCode: item.loan_code || `#${item.id}`,
                                    bookTitle: item.book_title || item.title,
                                  })
                                }
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1 font-semibold cursor-pointer shadow-xs"
                              >
                                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                                <span>QR Code</span>
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    isOpen: true,
                                    title: "Batal Booking",
                                    message: `Yakin membatalkan booking buku "${item.book_title || item.title}"?`,
                                    type: "cancel",
                                    loanId: item.id,
                                  })
                                }
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-semibold cursor-pointer border border-rose-200"
                              >
                                Batal
                              </button>
                            </div>
                          )}

                          {activeTab === "active" && isBorrowed && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Perpanjang Pinjaman",
                                  message: `Ajukan perpanjangan durasi pinjam (+7 Hari) untuk buku "${item.book_title || item.title}"?`,
                                  type: "extend",
                                  loanId: item.id,
                                })
                              }
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 font-bold cursor-pointer shadow-xs mx-auto"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                              <span>Perpanjang</span>
                            </button>
                          )}

                          {activeTab === "history" && (
                            <span className="text-slate-400 text-xs font-mono">
                              Selesai
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
              <p>
                {activeTab === "active"
                  ? "Tidak ada data peminjaman aktif saat ini."
                  : "Belum ada histori transaksi peminjaman buku yang selesai."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* POPUP MODAL QR CODE */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 relative border border-slate-100 shadow-2xl">
            <button
              onClick={() => setQrModal({ ...qrModal, isOpen: false })}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">
              QR Code Pengambilan Buku
            </h3>
            <p className="text-xs text-slate-500">{qrModal.bookTitle}</p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrModal.loanCode}`}
                alt="QR Code Transaksi"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="text-xs font-mono font-bold text-amber-600">
              {qrModal.loanCode}
            </p>
          </div>
        </div>
      )}

      {/* POPUP CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-100 shadow-2xl">
            <HelpCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }
                className="w-1/2 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteAction}
                className="w-1/2 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
