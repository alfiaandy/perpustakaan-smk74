import React, { useState } from "react";
import Catalog from "./pages/public/Catalog";
import Home from "./pages/public/Home";
import NewsInfo from "./pages/public/NewsInfo";
import Login from "./pages/admin/Login";
import RegisterSiswa from "./pages/public/RegisterSiswa";
import ForgotPassword from "./pages/public/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import VisitorScanner from "./pages/admin/VisitorScanner";

export default function App() {
  // Ambil data user tersimpan dari localStorage jika ada
  const savedUser = JSON.parse(localStorage.getItem("user")) || null;

  // Tentukan halaman awal berdasarkan status login user
  const initialPage = savedUser
    ? savedUser.role === "admin" || savedUser.role === "pustakawan"
      ? "dashboard"
      : "catalog"
    : "catalog"; // Default membuka katalog untuk publik/guest

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [user, setUser] = useState(savedUser);

  // Handler Update Profil / User State
  const handleUserUpdated = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  // Handler Login Berhasil
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.role === "admin" || userData.role === "pustakawan") {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("catalog");
    }
  };

  // Handler Logout: Hapus Sesi & Auto Redirect ke Login
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentPage("login");
  };

  // Handler Navigasi Dashboard Berdasarkan Role
  const handleGoToDashboard = () => {
    if (user?.role === "admin" || user?.role === "pustakawan") {
      setCurrentPage("dashboard");
    } else if (user?.role === "siswa") {
      setCurrentPage("student-dashboard");
    }
  };

  // 1. Tampilan Dashboard Admin / Pustakawan
  if (
    currentPage === "dashboard" &&
    user &&
    (user.role === "admin" || user.role === "pustakawan")
  ) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onGoToCatalog={() => setCurrentPage("catalog")}
        onOpenScanner={() => setCurrentPage("visitor-scanner")}
      />
    );
  }

  // 2. Tampilan Halaman Scanner QR Absensi Pengunjung (Admin / Pustakawan)
  if (
    currentPage === "visitor-scanner" &&
    user &&
    (user.role === "admin" || user.role === "pustakawan")
  ) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
          >
            ← Kembali ke Dashboard
          </button>
          <span className="text-xs text-slate-500 font-semibold">
            Petugas: {user.full_name || user.username}
          </span>
        </div>
        <VisitorScanner />
      </div>
    );
  }

  // 3. Tampilan Dashboard Khusus Siswa
  if (currentPage === "student-dashboard" && user && user.role === "siswa") {
    return (
      <StudentDashboard
        user={user}
        onUserUpdated={handleUserUpdated}
        onLogout={handleLogout}
        onGoToCatalog={() => setCurrentPage("catalog")}
      />
    );
  }

  // 4. Tampilan Registrasi Akun Siswa
  if (currentPage === "register") {
    return <RegisterSiswa onBackToLogin={() => setCurrentPage("login")} />;
  }

  // 5. Tampilan Lupa / Reset Password Siswa
  if (currentPage === "forgot") {
    return <ForgotPassword onBackToLogin={() => setCurrentPage("login")} />;
  }

  // 6. Tampilan Halaman Login
  if (currentPage === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onBackToCatalog={() => setCurrentPage("catalog")}
        onOpenRegister={() => setCurrentPage("register")}
        onOpenForgot={() => setCurrentPage("forgot")}
      />
    );
  }

  // 7. Tampilan Halaman Berita & Info Publik
  if (currentPage === "news") {
    return <NewsInfo onBackToHome={() => setCurrentPage("catalog")} />;
  }

  // 8. Tampilan Utama Katalog OPAC (Bisa diakses Guest maupun Siswa Login)
  return (
    <Catalog
      user={user}
      onLogout={handleLogout}
      onGoToDashboard={handleGoToDashboard}
      onOpenLogin={() => setCurrentPage("login")}
      onOpenNews={() => setCurrentPage("news")}
    />
  );
}
