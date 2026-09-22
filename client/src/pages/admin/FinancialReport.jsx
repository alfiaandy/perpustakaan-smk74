import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DollarSign,
  Calendar,
  Filter,
  Download,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  BookX,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function FinancialReport() {
  const reportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_late_fee: 0,
    total_lost_book: 0,
    total_damaged_book: 0,
  });

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Fetch Laporan Keuangan
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (paymentType) params.payment_type = paymentType;

      const res = await API.get("/fines/report", { params });
      if (res.data.success) {
        setPayments(res.data.data || []);
        setSummary(
          res.data.summary || {
            total_income: 0,
            total_late_fee: 0,
            total_lost_book: 0,
            total_damaged_book: 0,
          },
        );
      }
    } catch (err) {
      console.error("Gagal memuat laporan keuangan:", err);
      setError(
        err.response?.data?.message || "Gagal memuat data laporan keuangan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Format Mata Uang Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  // Helper Badge Jenis Pembayaran
  const getPaymentBadge = (type) => {
    switch (type) {
      case "late_fee":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            Denda Terlambat
          </span>
        );
      case "lost_book":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            Ganti Buku Hilang
          </span>
        );
      case "damaged_book":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
            Ganti Buku Rusak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize">
            {type}
          </span>
        );
    }
  };

  // Export Laporan ke PDF
  const handleExportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `Laporan_Keuangan_Perpus_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (err) {
      console.error("Gagal export PDF:", err);
      alert("Terjadi kesalahan saat mencetak PDF laporan.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Laporan Keuangan & Denda
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi penerimaan uang denda keterlambatan dan penggantian
            koleksi buku.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={downloading || payments.length === 0}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Cetak PDF Laporan</span>
        </button>
      </div>

      {/* FILTER TANGGAL & JENIS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-amber-600" />
          <span>Filter Laporan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jenis Transaksi
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Semua Jenis Transaksi</option>
              <option value="late_fee">Denda Terlambat</option>
              <option value="lost_book">Ganti Buku Hilang</option>
              <option value="damaged_book">Ganti Buku Rusak</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchReport}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIK RINGKASAN PEMASUKAN */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pemasukan
            </p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">
              {formatRupiah(summary.total_income)}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Denda Terlambat
            </p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">
              {formatRupiah(summary.total_late_fee)}
            </p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Buku Hilang
            </p>
            <p className="text-xl font-extrabold text-rose-600 mt-1">
              {formatRupiah(summary.total_lost_book)}
            </p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <BookX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Buku Rusak
            </p>
            <p className="text-xl font-extrabold text-orange-600 mt-1">
              {formatRupiah(summary.total_damaged_book)}
            </p>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AREA TABEL LAPORAN (DIREF UNTUK EXPORT PDF) */}
      <div
        ref={reportRef}
        className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold font-heading text-slate-900">
            Rincian Transaksi Pemasukan Keuangan
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Total Transaksi: {payments.length} Data
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-sm font-medium">Memuat data laporan...</span>
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="p-3 pl-4">#</th>
                  <th className="p-3">Tanggal Bayar</th>
                  <th className="p-3">NISN / ID</th>
                  <th className="p-3">Nama Anggota</th>
                  <th className="p-3">Jenis Transaksi</th>
                  <th className="p-3">Nominal (Rp)</th>
                  <th className="p-3">Petugas Penerima</th>
                  <th className="p-3 pr-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 pl-4 font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-3 font-medium">
                      {new Date(item.payment_date).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {item.identity_number || "-"}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {item.member_name || "Anggota"}
                    </td>
                    <td className="p-3">
                      {getPaymentBadge(item.payment_type)}
                    </td>
                    <td className="p-3 font-bold text-emerald-700">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="p-3 font-medium text-slate-600">
                      {item.officer_name || "Admin"}
                    </td>
                    <td className="p-3 pr-4 text-slate-500">
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-medium">
              Belum ada riwayat transaksi keuangan denda yang tercatat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
