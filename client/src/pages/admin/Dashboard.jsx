import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BookManager from "./BookManager";
import MemberManager from "./MemberManager";
import LoanManager from "./LoanManager";
import NewsManager from "./NewsManager";
import ModuleManager from "./ModuleManager";
import LibrarianManager from "./LibrarianManager";
import VisitorScanner from "./VisitorScanner";
import VisitorReport from "./VisitorReport";
import FinancialReport from "./FinancialReport";
import API from "../../services/api";
import { BookOpen, Users, ArrowLeftRight, Clock, Menu } from "lucide-react";

export default function Dashboard({ user, onLogout, onGoToCatalog }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State Data Statistik Dinamis
  const [stats, setStats] = useState({
    total_books: 0,
    total_members: 0,
    borrowed_today: 0,
    overdue_count: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fungsi Fetch Statistik Real-time dari API
  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      // Panggil endpoint API utama
      const [booksRes, membersRes, loansRes] = await Promise.all([
        API.get("/books").catch(() => ({ data: { data: [] } })),
        API.get("/users/students").catch(() => ({ data: { data: [] } })),
        API.get("/loans").catch(() => ({ data: { data: [] } })),
      ]);

      const booksData = booksRes.data?.data || [];
      const membersData = membersRes.data?.data || [];
      const loansData = loansRes.data?.data || [];

      // Hitung Dipinjam Hari Ini (Berdasarkan borrow_date hari ini)
      const todayStr = new Date().toISOString().split("T")[0];
      const borrowedToday = loansData.filter((l) => {
        if (!l.borrow_date) return false;
        const bDate = new Date(l.borrow_date).toISOString().split("T")[0];
        return bDate === todayStr;
      }).length;

      // Hitung Tenggat Terlewati (Status dipinjam & tanggal tenggat < hari ini)
      const now = new Date();
      const overdue = loansData.filter((l) => {
        if (l.status === "returned") return false;
        if (!l.due_date) return false;
        return new Date(l.due_date) < now;
      }).length;

      setStats({
        total_books: booksData.length,
        total_members: membersData.length,
        borrowed_today: borrowedToday,
        overdue_count: overdue,
      });
    } catch (err) {
      console.error("Gagal memuat statistik dashboard:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-main)] text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
        onLogout={onLogout}
        onGoToCatalog={onGoToCatalog}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Dashboard Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {/* Header Dashboard + Tombol Hamburger Menu Mobile */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 md:hidden shadow-xs cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 leading-tight">
                Selamat Datang, {user?.full_name || "Administrator Utama"}!
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Ringkasan statistik dan aktivitas perpustakaan hari ini.
              </p>
            </div>
          </div>
        </header>

        {/* Dynamic Content Based on Menu */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6 md:space-y-8">
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* Total Koleksi */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Total Koleksi
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-900">
                    {loadingStats ? "..." : stats.total_books}
                  </h3>
                </div>
              </div>

              {/* Total Anggota */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Total Anggota
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-900">
                    {loadingStats ? "..." : stats.total_members}
                  </h3>
                </div>
              </div>

              {/* Dipinjam Hari Ini */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Dipinjam Hari Ini
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-900">
                    {loadingStats ? "..." : stats.borrowed_today}
                  </h3>
                </div>
              </div>

              {/* Tenggat Terlewati */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Tenggat Terlewati
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-rose-600">
                    {loadingStats ? "..." : stats.overdue_count}
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick Info Box */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg md:text-xl font-bold font-heading text-slate-900 mb-2 md:mb-3">
                Informasi Sistem
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Fitur Manajemen Data Buku, Data Anggota Siswa, Transaksi
                Peminjaman/Pengembalian, Laporan Keuangan & Denda, Scan QR
                Absensi Pengunjung, Pengelolaan Berita & Modul Digital, serta
                Tim Pustakawan telah aktif sepenuhnya.
              </p>
            </div>
          </div>
        )}

        {/* Component Scan Absensi QR */}
        {activeMenu === "visitor-scanner" && <VisitorScanner />}

        {/* Component Rekap Pengunjung */}
        {activeMenu === "visitor-reports" && <VisitorReport />}

        {/* Component Kelola Buku */}
        {activeMenu === "books" && <BookManager />}

        {/* Component Kelola Anggota Siswa */}
        {activeMenu === "members" && <MemberManager />}

        {/* Component Transaksi Peminjaman / Pengembalian */}
        {activeMenu === "loans" && <LoanManager />}

        {/* Component Laporan Keuangan & Denda */}
        {activeMenu === "financial-report" && <FinancialReport />}

        {/* Component Kelola Berita & Pengumuman */}
        {activeMenu === "news" && <NewsManager />}

        {/* Component Repositori Modul Digital */}
        {activeMenu === "modules" && <ModuleManager />}

        {/* Component Manajemen Tim Pustakawan */}
        {activeMenu === "librarians" && <LibrarianManager />}

        {/* Menu Lainnya (Fallback) */}
        {activeMenu !== "dashboard" &&
          activeMenu !== "visitor-scanner" &&
          activeMenu !== "visitor-reports" &&
          activeMenu !== "books" &&
          activeMenu !== "members" &&
          activeMenu !== "loans" &&
          activeMenu !== "financial-report" &&
          activeMenu !== "news" &&
          activeMenu !== "modules" &&
          activeMenu !== "librarians" && (
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs md:text-sm">
              Modul <strong className="capitalize">{activeMenu}</strong> akan
              diimplementasikan pada langkah berikutnya.
            </div>
          )}
      </main>
    </div>
  );
}
