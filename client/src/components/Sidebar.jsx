import React from "react";
import logo74 from "../assets/logo74.png";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  LogOut,
  Globe,
  Newspaper,
  FileText,
  UserCheck,
  QrCode,
  BarChart3, // Import icon untuk Rekap Pengunjung
  X,
} from "lucide-react";

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  user,
  onLogout,
  onGoToCatalog,
  isOpen,
  onClose,
}) {
  const menus = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "visitor-scanner", label: "Scan Absensi", icon: QrCode },
    { id: "visitor-reports", label: "Rekap Pengunjung", icon: BarChart3 }, // Menu Baru
    { id: "books", label: "Kelola Buku", icon: BookOpen },
    { id: "members", label: "Data Anggota", icon: Users },
    { id: "loans", label: "Transaksi Pinjam", icon: ArrowLeftRight },
    { id: "news", label: "Kelola Berita", icon: Newspaper },
    { id: "modules", label: "Modul Digital", icon: FileText },
    { id: "librarians", label: "Tim Pustakawan", icon: UserCheck },
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* BACKDROP OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* CONTAINER SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[var(--color-brand-primary)] text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* 1. AREA MENUS ATAS */}
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-[var(--color-brand-primary)] z-10">
            <div className="flex items-center space-x-3">
              <img
                src={logo74}
                alt="Logo SMKN 74"
                className="h-9 w-auto object-contain"
              />
              <div>
                <h1 className="font-heading font-bold text-white text-base leading-tight">
                  PERPUSTAKAAN
                </h1>
                <p className="text-xs text-amber-500 tracking-wider font-semibold uppercase">
                  Panel Petugas
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {menus.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                      : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 2. AREA TOMBOL BAWAH */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-[var(--color-brand-primary)] mt-auto">
          <button
            onClick={() => {
              onGoToCatalog();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-500 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Lihat Web Utama</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
