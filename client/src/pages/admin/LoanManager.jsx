import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import { Html5Qrcode } from "html5-qrcode";
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
  QrCode,
  CalendarPlus,
  Filter,
  DollarSign,
  AlertTriangle,
  Camera,
} from "lucide-react";

export default function LoanManager() {
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'all'
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Validasi Penyerahan Buku / Quick Code & Camera State
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [inputTransactionCode, setInputTransactionCode] = useState("");
  const [useCamera, setUseCamera] = useState(false);

  // Ref Pengunci Scan Agar Tidak Kebaca Berulang Kali
  const isScanningRef = useRef(false);

  // Form State Pinjam Langsung
  const [formData, setFormData] = useState({
    user_id: "",
    book_id: "",
    loan_days: 7,
  });

  // State Pop Box Konfirmasi Aksi
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "approve",
    actionData: null,
  });

  // State Pop Box Notifikasi
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

  // Effect Kamera Scanner HTML5 QR Code (Dengan Jeda & Debounce)
  useEffect(() => {
    let html5QrCode = null;
    isScanningRef.current = false;

    if (scanModalOpen && useCamera) {
      // Jeda 600ms agar kamera siap dan memunculkan pop-up izin browser
      const timer = setTimeout(() => {
        html5QrCode = new Html5Qrcode("reader");

        // Set FPS lebih rendah (5 fps) agar kamera tidak terlalu agresif/terlalu cepat membaca
        const config = { fps: 5, qrbox: { width: 220, height: 220 } };

        html5QrCode
          .start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Pengunci agar hanya memproses 1 kali scan
              if (isScanningRef.current) return;
              isScanningRef.current = true;

              // Berhentikan scanner terlebih dahulu sebelum eksekusi hasil
              html5QrCode
                .stop()
                .then(() => {
                  setUseCamera(false);
                  setTimeout(() => {
                    handleVerifyCode(decodedText);
                  }, 300);
                })
                .catch((err) => console.error(err));
            },
            (errorMessage) => {
              // Frame error saat tidak ada QR diabaikan
            },
          )
          .catch((err) => {
            console.error("Gagal membuka kamera:", err);
            setUseCamera(false);
          });
      }, 600);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch((e) => console.error(e));
        }
      };
    }
  }, [scanModalOpen, useCamera]);

  // Handler Verifikasi Kode Transaksi
  const handleVerifyCode = (codeToVerify) => {
    const code = codeToVerify || inputTransactionCode;
    const cleanCode = code ? code.trim() : "";

    if (!cleanCode) {
      setAlertModal({
        isOpen: true,
        title: "Peringatan",
        message: "Silakan masukkan atau scan kode transaksi terlebih dahulu.",
        isError: true,
      });
      return;
    }

    const targetLoan = loans.find(
      (item) =>
        item.loan_code === cleanCode ||
        `#${item.id}` === cleanCode ||
        String(item.id) === cleanCode.replace("#", ""),
    );

    if (targetLoan) {
      setScanModalOpen(false);
      setUseCamera(false);
      setInputTransactionCode("");
      handleApproveClick(
        targetLoan.id,
        targetLoan.student_name,
        targetLoan.book_title,
      );
    } else {
      setAlertModal({
        isOpen: true,
        title: "Kode Tidak Ditemukan",
        message: `Kode transaksi "${cleanCode}" tidak ditemukan atau statusnya sudah tidak aktif.`,
        isError: true,
      });
    }
  };

  // Trigger Pop Box Persetujuan
  const handleApproveClick = (id, studentName, bookTitle) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Persetujuan",
      message: `Setujui pengajuan peminjaman "${bookTitle}" oleh ${studentName}? Buku akan diserahkan ke siswa.`,
      type: "approve",
      actionData: { id },
    });
  };

  // Trigger Pop Box Penolakan
  const handleRejectClick = (id, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Penolakan",
      message: `Tolak pengajuan peminjaman oleh ${studentName}? Stok buku akan dikembalikan.`,
      type: "reject",
      actionData: { id },
    });
  };

  // Trigger Pop Box Pengembalian Buku
  const handleReturnClick = (loan) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Pengembalian",
      message: `Proses pengembalian buku "${loan.book_title}" oleh ${loan.student_name}?`,
      type: "return",
      actionData: loan,
    });
  };

  // Override Perpanjangan Manual oleh Admin
  const handleOverrideExtend = async (loanId) => {
    const extraDays = prompt(
      "Masukkan jumlah hari perpanjangan tambahan:",
      "7",
    );
    if (!extraDays) return;

    try {
      const res = await API.put(`/loans/${loanId}/admin-extend`, { extraDays });
      if (res.data.success) {
        setAlertModal({
          isOpen: true,
          title: "Perpanjangan Berhasil!",
          message:
            res.data.message ||
            `Peminjaman berhasil diperpanjang ${extraDays} hari.`,
          isError: false,
        });
        fetchData();
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Gagal Perpanjang",
        message:
          err.response?.data?.message || "Gagal memperpanjang masa pinjam.",
        isError: true,
      });
    }
  };

  // Kalkulator Estimasi Denda Real-Time
  const calculateFine = (dueDateStr, fineAmountFromDB) => {
    if (fineAmountFromDB && Number(fineAmountFromDB) > 0) {
      return Number(fineAmountFromDB);
    }
    if (!dueDateStr) return 0;

    const dueDate = new Date(dueDateStr);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 1000;
    }
    return 0;
  };

  // Eksekusi Pilihan Konfirmasi
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
            message:
              "Pengajuan peminjaman berhasil dibatalkan dan stok dikembalikan.",
            isError: false,
          });
          fetchData();
        }
      } else if (type === "return") {
        const res = await API.put(`/loans/${actionData.id}/return`);

        if (res.data.success) {
          const fineAmount =
            res.data.fine_amount || actionData.fine_amount || 0;

          if (fineAmount > 0) {
            try {
              await API.post("/fines/pay", {
                loan_id: actionData.id,
                member_id: actionData.member_id || actionData.user_id,
                payment_type: "late_fee",
                amount: fineAmount,
                notes: `Denda keterlambatan pengembalian buku "${actionData.book_title}"`,
              });
            } catch (fineErr) {
              console.error(
                "Gagal mencatat transaksi denda ke modul keuangan:",
                fineErr,
              );
            }

            setAlertModal({
              isOpen: true,
              title: "Buku Dikembalikan (Terkena Denda)",
              message: `Buku berhasil dikembalikan! Denda keterlambatan sebesar Rp ${Number(
                fineAmount,
              ).toLocaleString("id-ID")} telah dicatat di Laporan Keuangan.`,
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

  // Simpan Peminjaman Langsung di Tempat
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

  const pendingLoans = loans.filter(
    (l) => l.status === "menunggu_konfirmasi" || l.status === "booking",
  );

  const filteredLoans = loans
    .filter((l) =>
      activeTab === "pending"
        ? l.status === "menunggu_konfirmasi" || l.status === "booking"
        : true,
    )
    .filter((l) => {
      const isBorrowed = l.status === "dipinjam" || l.status === "borrowed";
      const isOverdue =
        isBorrowed && l.due_date && new Date(l.due_date) < new Date();

      if (
        statusFilter === "menunggu_konfirmasi" &&
        l.status !== "menunggu_konfirmasi" &&
        l.status !== "booking"
      )
        return false;
      if (statusFilter === "dipinjam" && !isBorrowed) return false;
      if (statusFilter === "terlambat" && !isOverdue) return false;
      if (
        statusFilter === "dikembalikan" &&
        l.status !== "dikembalikan" &&
        l.status !== "returned"
      )
        return false;
      if (
        statusFilter === "expired" &&
        l.status !== "expired" &&
        l.status !== "ditolak" &&
        l.status !== "batal"
      )
        return false;
      return true;
    })
    .filter((l) => {
      const query = search.toLowerCase();
      return (
        l.student_name?.toLowerCase().includes(query) ||
        l.book_title?.toLowerCase().includes(query) ||
        l.student_nisn?.toLowerCase().includes(query) ||
        l.loan_code?.toLowerCase().includes(query) ||
        `#${l.id}`.includes(query)
      );
    });

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
            Kelola persetujuan pengajuan siswa, penyerahan buku, kalkulasi
            denda, & perpanjangan masa pinjam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setScanModalOpen(true);
              setUseCamera(false);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-md cursor-pointer transition"
          >
            <QrCode className="w-4 h-4 mr-1.5 text-amber-400" /> Validasi Kode
            Transaksi
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-md cursor-pointer transition"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Pinjam Langsung di Tempat
          </button>
        </div>
      </div>

      {/* Navigation Tabs, Dropdown Status Filter, & Search Bar */}
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

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent focus:outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu_konfirmasi">Menunggu Diambil</option>
              <option value="dipinjam">Sedang Dipinjam</option>
              <option value="terlambat">Terlambat (Warning)</option>
              <option value="dikembalikan">Dikembalikan</option>
              <option value="expired">Expired / Batal</option>
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari kode, siswa, NISN, atau judul..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Table Transaksi */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Kode & Buku</th>
              <th className="p-4">Siswa / Peminjam</th>
              <th className="p-4">Tgl Pinjam / Booking</th>
              <th className="p-4">Batas Ambil / Jatuh Tempo</th>
              <th className="p-4">Status</th>
              <th className="p-4">Kalkulasi Denda</th>
              <th className="p-4 text-center">Aksi / Override</th>
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
                    : "Tidak ada riwayat transaksi yang cocok."}
                </td>
              </tr>
            ) : (
              filteredLoans.map((l) => {
                const isBorrowed =
                  l.status === "dipinjam" || l.status === "borrowed";
                const isReturned =
                  l.status === "dikembalikan" || l.status === "returned";
                const isPending =
                  l.status === "menunggu_konfirmasi" || l.status === "booking";
                const isOverdue =
                  isBorrowed && l.due_date && new Date(l.due_date) < new Date();

                const estimatedFine = calculateFine(l.due_date, l.fine_amount);

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
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
                        <p className="font-mono font-bold text-amber-600 text-[11px]">
                          {l.loan_code || `#${l.id}`}
                        </p>
                        <p className="font-semibold text-slate-800 leading-snug mt-0.5">
                          {l.book_title}
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

                    <td className="p-4 text-slate-600 font-medium">
                      {l.due_date
                        ? new Date(l.due_date).toLocaleDateString("id-ID")
                        : l.max_take_date
                          ? new Date(l.max_take_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                    </td>

                    <td className="p-4">
                      {isPending && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" /> Menunggu Diambil
                        </span>
                      )}
                      {isBorrowed && !isOverdue && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3 mr-1" /> Sedang Dipinjam
                        </span>
                      )}
                      {isBorrowed && isOverdue && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white border border-rose-600 animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Terlambat
                          (Warning)
                        </span>
                      )}
                      {isReturned && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Dikembalikan
                        </span>
                      )}
                      {(l.status === "ditolak" ||
                        l.status === "expired" ||
                        l.status === "batal") && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> Expired /
                          Batal
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold">
                      {estimatedFine > 0 ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Rp {estimatedFine.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
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
                            title="Setujui & Serahkan Buku"
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleReturnClick(l)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-[11px] font-bold cursor-pointer shadow-sm"
                          >
                            Kembalikan
                          </button>

                          <button
                            onClick={() => handleOverrideExtend(l.id)}
                            className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            title="Perpanjang Masa Pinjam (Manual Admin)"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>+Hari</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SCAN / INPUT KODE TRANSAKSI MANUAL DENGAN KAMERA */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => {
                setScanModalOpen(false);
                setUseCamera(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Validasi Penyerahan Buku
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan QR Code siswa dengan kamera atau ketik kode transaksi
                secara manual.
              </p>
            </div>

            {useCamera ? (
              <div className="space-y-3">
                <div
                  id="reader"
                  className="overflow-hidden rounded-2xl border border-slate-200 min-h-[220px] bg-black"
                ></div>
                <button
                  type="button"
                  onClick={() => setUseCamera(false)}
                  className="w-full py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Kembali ke Input Manual
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Contoh: LNK-20260921-ABCD atau #12"
                  value={inputTransactionCode}
                  onChange={(e) => setInputTransactionCode(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseCamera(true)}
                    className="w-1/2 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyCode()}
                    className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Cari & Verifikasi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POP BOX MODAL KONFIRMASI */}
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

      {/* POP BOX MODAL NOTIFIKASI HASIL */}
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
