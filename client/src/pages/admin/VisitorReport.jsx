import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  Info,
  Download,
  FileSpreadsheet,
  X,
  ChevronRight,
} from "lucide-react";

export default function VisitorReport() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total_today: 0,
    total_month: 0,
    total_all: 0,
  });
  const [period, setPeriod] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateInfoText, setDateInfoText] = useState("");

  // --- STATE PAGINASI (MAX 10 LIST PER HALAMAN) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk Kontrol Modal Konfirmasi Export
  const [showExportModal, setShowExportModal] = useState(false);

  const availableYears = Array.from({ length: 10 }, (_, i) => 2026 + i);

  const monthsList = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const getWeekRangeText = () => {
    const curr = new Date();
    const dayOfWeek = curr.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const options = { day: "numeric", month: "short", year: "numeric" };
    return `Minggu Ini (${monday.toLocaleDateString("id-ID", options)} s/d ${friday.toLocaleDateString("id-ID", options)})`;
  };

  // Fungsi Mendapatkan Label Teks Periode Aktif
  const getPeriodLabel = () => {
    const monthName = monthsList.find(
      (m) => m.value === Number(selectedMonth),
    )?.label;
    if (period === "today") return "Hari Ini";
    if (period === "weekly") return getWeekRangeText();
    if (period === "monthly") return `Bulan ${monthName} ${selectedYear}`;
    if (period === "yearly") return `Tahun ${selectedYear}`;
    return "Semua Waktu";
  };

  const fetchVisitorLogs = async () => {
    try {
      setLoading(true);

      if (period === "today") {
        const todayText = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setDateInfoText(`Menampilkan absensi hari: ${todayText}`);
      } else if (period === "weekly") {
        setDateInfoText(getWeekRangeText());
      } else if (period === "monthly") {
        const monthLabel = monthsList.find(
          (m) => m.value === Number(selectedMonth),
        )?.label;
        setDateInfoText(`Rekapitulasi Bulan: ${monthLabel} ${selectedYear}`);
      } else if (period === "yearly") {
        setDateInfoText(`Rekapitulasi Tahun: ${selectedYear}`);
      } else {
        setDateInfoText("Menampilkan seluruh riwayat absensi pengunjung.");
      }

      const queryParams = { period, search };
      if (period === "monthly") {
        queryParams.month = Number(selectedMonth);
        queryParams.year = Number(selectedYear);
      } else if (period === "yearly") {
        queryParams.year = Number(selectedYear);
      }

      const res = await API.get("/visitor-logs", { params: queryParams });

      if (res.data.success) {
        setLogs(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data rekap pengunjung:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorLogs();
  }, [period, selectedMonth, selectedYear]);

  // Reset ke halaman 1 setiap kali periode atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [period, selectedMonth, selectedYear, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVisitorLogs();
  };

  // --- LOGIKA PERHITUNGAN PAGINASI ---
  const totalItems = logs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

  const startResult = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endResult = Math.min(indexOfLastItem, totalItems);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Eksekusi Download PDF Setelah Di-konfirmasi
  const executeExportToPDF = () => {
    setShowExportModal(false);
    try {
      const doc = new jsPDF();
      const periodText = getPeriodLabel();

      // Header PDF
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LAPORAN REKAPITULASI PENGUNJUNG PERPUSTAKAAN", 14, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("SMK Negeri 74 Jakarta", 14, 21);
      doc.text(`Periode Filter : ${periodText}`, 14, 27);
      doc.text(
        `Tanggal Cetak  : ${new Date().toLocaleDateString("id-ID")}`,
        14,
        33,
      );
      doc.text(`Total Record   : ${logs.length} Data Pengunjung`, 14, 39);

      doc.setLineWidth(0.5);
      doc.line(14, 43, 196, 43);

      // Data Baris Tabel
      const tableRows = logs.map((item, index) => [
        index + 1,
        `${new Date(item.visit_date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} · ${item.visit_time}`,
        item.full_name,
        item.nisn,
        item.class || "-",
      ]);

      autoTable(doc, {
        startY: 47,
        head: [
          ["No", "Waktu Kunjungan", "Nama Siswa", "NISN", "Kelas / Jurusan"],
        ],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [217, 119, 6],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 45 },
          2: { cellWidth: 60 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
        },
      });

      doc.save(
        `Rekap_Pengunjung_${periodText.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      );
    } catch (err) {
      console.error("Error Export PDF:", err);
      alert("Gagal mengunduh laporan PDF: " + err.message);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            Rekapitulasi Pengunjung
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola dan pantau riwayat absensi pengunjung perpustakaan secara
            mendalam.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tombol Memicu Modal Export PDF */}
          <button
            onClick={() => setShowExportModal(true)}
            disabled={logs.length === 0}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={fetchVisitorLogs}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Cards Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Hari Ini</p>
            <h3 className="text-2xl font-bold font-heading text-slate-900">
              {stats.total_today || 0}{" "}
              <span className="text-xs font-normal text-slate-400">Siswa</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Bulan Ini (
              {
                monthsList.find((m) => m.value === new Date().getMonth() + 1)
                  ?.label
              }{" "}
              2026)
            </p>
            <h3 className="text-2xl font-bold font-heading text-slate-900">
              {stats.total_month || 0}{" "}
              <span className="text-xs font-normal text-slate-400">Siswa</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Total Keseluruhan
            </p>
            <h3 className="text-2xl font-bold font-heading text-slate-900">
              {stats.total_all || 0}{" "}
              <span className="text-xs font-normal text-slate-400">
                Pengunjung
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-600">
                Periode:
              </span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="weekly">Minggu Ini (Senin - Jumat)</option>
                <option value="monthly">Pilih Bulanan</option>
                <option value="yearly">Pilih Tahunan</option>
              </select>
            </div>

            {period === "monthly" && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none cursor-pointer"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {period === "yearly" && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-72"
          >
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 font-medium focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {dateInfoText && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/70 border border-amber-100 px-3 py-1.5 rounded-lg">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span className="font-medium">{dateInfoText}</span>
          </div>
        )}
      </div>

      {/* Tabel Data Rekap Pengunjung */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Tanggal & Jam</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Kelas / Jurusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Memuat data rekap pengunjung...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-slate-400 font-semibold"
                  >
                    Belum ada data pengunjung untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                currentLogs.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          {new Date(item.visit_date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}{" "}
                          · {item.visit_time}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.full_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.nisn}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                        {item.class || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER TABEL & PAGINASI */}
        {!loading && totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {startResult} - {endResult} dari {totalItems}{" "}
              Pengunjung
            </p>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-3 h-8 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                    currentPage === totalPages
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-amber-700 border-slate-200 hover:bg-amber-50"
                  }`}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL KONFIRMASI EXPORT PDF */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  Konfirmasi Export PDF
                </h3>
                <p className="text-xs text-slate-500">
                  Unduh Laporan Rekapitulasi Pengunjung
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs mb-6">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">
                  Periode Filter:
                </span>
                <span className="font-bold text-slate-800">
                  {getPeriodLabel()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Jumlah Data:</span>
                <span className="font-bold text-amber-600">
                  {logs.length} Pengunjung
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Format Berkas:
                </span>
                <span className="font-bold text-rose-600">
                  Dokumen PDF (.pdf)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin mengunduh laporan absensi pengunjung untuk{" "}
              <strong className="text-slate-900">{getPeriodLabel()}</strong>{" "}
              ini?
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeExportToPDF}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
