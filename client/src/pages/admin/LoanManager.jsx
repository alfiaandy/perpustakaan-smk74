import React, { useState, useEffect } from "react";
import API from "../../services/api";
import {
  ArrowLeftRight,
  Plus,
  CheckCircle,
  Clock,
  Search,
  X,
  Check,
  Ban,
  AlertCircle,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react";

export default function LoanManager() {
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State Pinjam Langsung
  const [formData, setFormData] = useState({
    user_id: "",
    book_id: "",
    loan_days: 7,
  });

  // State Pop Box Konfirmasi Aksi (Setujui, Tolak, Kembalikan)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "approve", // 'approve' | 'reject' | 'return'
    actionData: null,
  });

  // State Pop Box Notifikasi Respon (Sukses / Error)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLoans, resStudents, resBooks] = await Promise.all([
        API.get("/loans"),
        API.get("/users/students"),
        API.get("/books"),
      ]);

      setLoans(resLoans.data.data || []);
      setStudents(resStudents.data.data || []);
      setBooks(resBooks.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Trigger Pop Box Persetujuan
  const handleApproveClick = (id, studentName, bookTitle) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Persetujuan",
      message: `Setujui pengajuan peminjaman "${bookTitle}" oleh ${studentName}?`,
      type: "approve",
      actionData: { id },
    });
  };

  // 2. Trigger Pop Box Penolakan
  const handleRejectClick = (id, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Penolakan",
      message: `Tolak pengajuan peminjaman oleh ${studentName}?`,
      type: "reject",
      actionData: { id },
    });
  };

  // 3. Trigger Pop Box Pengembalian Buku
  const handleReturnClick = (id, bookTitle, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Pengembalian",
      message: `Proses pengembalian buku "${bookTitle}" oleh ${studentName}?`,
      type: "return",
      actionData: { id },
    });
  };

  // Eksekusi Pilihan Pilihan dari Pop Box Konfirmasi
  const handleExecuteAction = async () => {
    const { type, actionData } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    if (!actionData?.id) return;

    try {
      if (type === "approve") {
        const res = await API.put(`/loans/${actionData.id}/approve`);
        if (res.data.success) {
          setAlertModal({
            isOpen: true,
            title: "Peminjaman Disetujui!",
            message: "Peminjaman disetujui! Buku berhasil diserahkan ke siswa.",
            isError: false,
          });
          fetchData();
        }
      } else if (type === "reject") {
        const res = await API.put(`/loans/${actionData.id}/reject`);
        if (res.data.success) {
          setAlertModal({
            isOpen: true,
            title: "Pengajuan Ditolak",
            message: "Pengajuan peminjaman berhasil dibatalkan.",
            isError: false,
          });
          fetchData();
        }
      } else if (type === "return") {
        const res = await API.put(`/loans/${actionData.id}/return`);
        if (res.data.success) {
          if (res.data.fine_amount > 0) {
            setAlertModal({
              isOpen: true,
              title: "Buku Dikembalikan (Terkena Denda)",
              message: `Buku berhasil dikembalikan! Terkena denda keterlambatan: Rp ${res.data.fine_amount.toLocaleString(
                "id-ID",
              )}`,
              isError: true,
            });
          } else {
            setAlertModal({
              isOpen: true,
              title: "Pengembalian Sukses!",
              message: "Buku berhasil dikembalikan tepat waktu!",
              isError: false,
            });
          }
          fetchData();
        }
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Gagal Memproses",
        message: err.response?.data?.message || "Gagal memproses transaksi.",
        isError: true,
      });
    }
  };

  // Simpan Peminjaman Langsung di Tempat (Direct Issue)
  const handleSubmitDirectLoan = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/loans/direct", formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({ user_id: "", book_id: "", loan_days: 7 });
        setAlertModal({
          isOpen: true,
          title: "Peminjaman Langsung Sukses!",
          message: "Transaksi peminjaman langsung di tempat berhasil dicatat.",
          isError: false,
        });
        fetchData();
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Gagal Peminjaman",
        message: err.response?.data?.message || "Gagal memproses peminjaman.",
        isError: true,
      });
    }
  };

  const pendingLoans = loans.filter((l) => l.status === "menunggu_konfirmasi");

  const filteredLoans = loans
    .filter((l) =>
      activeTab === "pending" ? l.status === "menunggu_konfirmasi" : true,
    )
    .filter(
      (l) =>
        l.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.book_title?.toLowerCase().includes(search.toLowerCase()) ||
        l.student_nisn?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="space-y-6 relative text-slate-800">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center">
              <ArrowLeftRight className="w-7 h-7 mr-2.5 text-amber-600" />{" "}
              Sirkulasi Peminjaman
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {loans.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola persetujuan pengajuan siswa & pencatatan transaksi peminjaman
            buku
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-md cursor-pointer transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Pinjam Langsung di Tempat
        </button>
      </div>

      {/* Navigation Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>Pengajuan Siswa</span>
            {pendingLoans.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingLoans.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua Riwayat
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari siswa, NISN, atau judul..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table Transaksi */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Buku</th>
              <th className="p-4">Siswa / Peminjam</th>
              <th className="p-4">Tgl Pinjam / Booking</th>
              <th className="p-4">Batas Ambil (H+7) / Kembali</th>
              <th className="p-4">Status</th>
              <th className="p-4">Denda</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">
                  Memuat data sirkulasi...
                </td>
              </tr>
            ) : filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">
                  {activeTab === "pending"
                    ? "Tidak ada pengajuan peminjaman baru dari siswa."
                    : "Tidak ada riwayat transaksi."}
                </td>
              </tr>
            ) : (
              filteredLoans.map((l) => {
                const isBorrowed =
                  l.status === "dipinjam" || l.status === "borrowed";
                const isReturned =
                  l.status === "dikembalikan" || l.status === "returned";
                const isPending = l.status === "menunggu_konfirmasi";
                const isOverdue =
                  isBorrowed && l.due_date && new Date(l.due_date) < new Date();

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    {/* TAMPILAN SAMPUL BUKU & JUDUL */}
                    <td className="p-4 flex items-center gap-3">
                      {l.cover_image ? (
                        <img
                          src={`http://localhost:5000/uploads/${l.cover_image}`}
                          alt={l.book_title}
                          className="w-8 h-12 object-cover rounded border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-slate-100 rounded flex items-center justify-center border border-slate-200 text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          {l.book_title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ID Transaksi: #{l.id}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 capitalize">
                        {l.student_name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">
                        NISN: {l.student_nisn || "-"}
                      </p>
                    </td>

                    <td className="p-4 text-slate-600">
                      {l.loan_date
                        ? new Date(l.loan_date).toLocaleDateString("id-ID")
                        : l.booking_date
                          ? new Date(l.booking_date).toLocaleDateString("id-ID")
                          : "-"}
                    </td>
                    <td className="p-4 text-slate-600">
                      {l.due_date
                        ? new Date(l.due_date).toLocaleDateString("id-ID")
                        : l.max_take_date
                          ? new Date(l.max_take_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                    </td>

                    {/* STATUS TRANSACTION BADGE */}
                    <td className="p-4">
                      {isPending && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" /> Menunggu Konfirmasi
                        </span>
                      )}
                      {isBorrowed && !isOverdue && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3 mr-1" /> Sedang Dipinjam
                        </span>
                      )}
                      {isBorrowed && isOverdue && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" /> Terlambat
                        </span>
                      )}
                      {isReturned && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Dikembalikan
                        </span>
                      )}
                      {l.status === "ditolak" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> Ditolak
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-700">
                      {l.fine_amount > 0 ? (
                        <span className="text-rose-600">
                          Rp {Number(l.fine_amount).toLocaleString("id-ID")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {isPending && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              handleApproveClick(
                                l.id,
                                l.student_name,
                                l.book_title,
                              )
                            }
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer"
                            title="Setujui Peminjaman"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleRejectClick(l.id, l.student_name)
                            }
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                            title="Tolak Pengajuan"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {isBorrowed && (
                        <button
                          onClick={() =>
                            handleReturnClick(
                              l.id,
                              l.book_title,
                              l.student_name,
                            )
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-[11px] font-bold cursor-pointer shadow-sm"
                        >
                          Kembalikan Buku
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* POP BOX MODAL KONFIRMASI (GANTI WINDOW.CONFIRM) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 relative">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
                confirmModal.type === "reject"
                  ? "bg-rose-100 text-rose-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              <HelpCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`w-1/2 py-2.5 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer ${
                  confirmModal.type === "reject"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP BOX MODAL NOTIFIKASI HASIL (GANTI WINDOW.ALERT) */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 relative">
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

      {/* MODAL FORM PINJAM LANGSUNG DI TEMPAT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold font-heading text-slate-900 mb-4">
              Peminjaman Langsung di Tempat
            </h3>

            <form
              onSubmit={handleSubmitDirectLoan}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Siswa (Anggota)
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Buku
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.book_id}
                  onChange={(e) =>
                    setFormData({ ...formData, book_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Buku --</option>
                  {books
                    .filter((b) => (b.available_stock ?? b.total_stock) > 0)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (Stok: {b.available_stock ?? b.total_stock})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Durasi Pinjam (Hari)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.loan_days}
                  onChange={(e) =>
                    setFormData({ ...formData, loan_days: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-md shadow-amber-200 cursor-pointer"
                >
                  Proses Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
