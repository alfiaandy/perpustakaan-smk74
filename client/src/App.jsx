import React, { useState } from "react";
import Catalog from "./pages/public/Catalog";
import Login from "./pages/admin/Login";
import RegisterSiswa from "./pages/public/RegisterSiswa";
import ForgotPassword from "./pages/public/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

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

  // Handler Login Berhasil
  const handleLoginSuccess = (userData) => {
    setUser(userData);
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
    setCurrentPage("login"); // Otomatis mengarahkan ke halaman login
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
      />
    );
  }

  // 2. Tampilan Dashboard Khusus Siswa
  if (currentPage === "student-dashboard" && user && user.role === "siswa") {
    return (
      <StudentDashboard
        user={user}
        onLogout={handleLogout}
        onGoToCatalog={() => setCurrentPage("catalog")}
      />
    );
  }

  // 3. Tampilan Registrasi Akun Siswa
  if (currentPage === "register") {
    return <RegisterSiswa onBackToLogin={() => setCurrentPage("login")} />;
  }

  // 4. Tampilan Lupa / Reset Password Siswa
  if (currentPage === "forgot") {
    return <ForgotPassword onBackToLogin={() => setCurrentPage("login")} />;
  }

  // 5. Tampilan Halaman Login
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

  // 6. Tampilan Utama Katalog OPAC (Bisa diakses Guest maupun Siswa Login)
  return (
    <Catalog
      user={user}
      onLogout={handleLogout}
      onGoToDashboard={handleGoToDashboard}
      onOpenLogin={() => setCurrentPage("login")}
    />
  );
}
