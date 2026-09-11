import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import BookManager from "./BookManager";
import MemberManager from "./MemberManager";
import LoanManager from "./LoanManager";
import { BookOpen, Users, ArrowLeftRight, Clock } from "lucide-react";

export default function Dashboard({ user, onLogout, onGoToCatalog }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-main)] text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
        onLogout={onLogout}
        onGoToCatalog={onGoToCatalog}
      />

      {/* Main Dashboard Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-slate-900">
              Selamat Datang, {user?.full_name || "Petugas"}!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ringkasan statistik dan aktivitas perpustakaan hari ini.
            </p>
          </div>
        </header>

        {/* Dynamic Content Based on Menu */}
        {activeMenu === "dashboard" && (
          <div className="space-y-8">
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Koleksi
                  </p>
                  <h3 className="text-2xl font-bold font-heading text-slate-900">
                    120
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Anggota
                  </p>
                  <h3 className="text-2xl font-bold font-heading text-slate-900">
                    450
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Dipinjam Hari Ini
                  </p>
                  <h3 className="text-2xl font-bold font-heading text-slate-900">
                    15
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Tenggat Terlewati
                  </p>
                  <h3 className="text-2xl font-bold font-heading text-slate-900">
                    3
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick Info Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold font-heading text-slate-900 mb-3">
                Informasi Sistem
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fitur Manajemen Data Buku, Data Anggota Siswa, dan Transaksi
                Peminjaman/Pengembalian sudah aktif. Sistem siap digunakan untuk
                operasional perpustakaan secara penuh.
              </p>
            </div>
          </div>
        )}

        {/* Component Kelola Buku (CRUD) */}
        {activeMenu === "books" && <BookManager />}

        {/* Component Kelola Anggota Siswa */}
        {activeMenu === "members" && <MemberManager />}

        {/* Component Transaksi Peminjaman / Pengembalian */}
        {activeMenu === "loans" && <LoanManager />}

        {/* Menu Lainnya */}
        {activeMenu !== "dashboard" &&
          activeMenu !== "books" &&
          activeMenu !== "members" &&
          activeMenu !== "loans" && (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
              Modul <strong className="capitalize">{activeMenu}</strong> akan
              diimplementasikan pada langkah berikutnya.
            </div>
          )}
      </main>
    </div>
  );
}
