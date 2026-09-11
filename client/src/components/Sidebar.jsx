import React from "react";
import logo74 from "../assets/logo74.png";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  LogOut,
  Globe,
} from "lucide-react";

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  user,
  onLogout,
  onGoToCatalog,
}) {
  const menus = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "books", label: "Kelola Buku", icon: BookOpen },
    { id: "members", label: "Data Anggota", icon: Users },
    { id: "loans", label: "Transaksi Pinjam", icon: ArrowLeftRight },
  ];

  return (
    <aside className="w-64 bg-[var(--color-brand-primary)] text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
          <img
            src={logo74}
            alt="Logo SMKN 74"
            className="h-9 w-auto object-contain"
          />
          <div>
            <h1 className="font-heading font-bold text-white text-base leading-tight">
              PERPUSTAKAAN
            </h1>
            <p className="text-[10px] text-amber-500 tracking-wider font-semibold uppercase">
              Panel Petugas
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile, Web Preview & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onGoToCatalog}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-500 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>Lihat Web Utama</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
