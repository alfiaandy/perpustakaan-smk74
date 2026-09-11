import React, { useState } from "react";
import Catalog from "./pages/public/Catalog";
import Login from "./pages/admin/Login";
import RegisterSiswa from "./pages/public/RegisterSiswa";
import ForgotPassword from "./pages/public/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";

export default function App() {
  // Ambil user dari localStorage jika ada
  const savedUser = JSON.parse(localStorage.getItem("user")) || null;

  // Tentukan halaman awal berdasarkan status user
  const initialPage = savedUser
    ? savedUser.role === "admin" || savedUser.role === "pustakawan"
      ? "dashboard"
      : "catalog"
    : "login";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [user, setUser] = useState(savedUser);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === "admin" || userData.role === "pustakawan") {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("catalog");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentPage("login");
  };

  // 1. Dashboard Admin/Pustakawan
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

  // 2. Register Siswa
  if (currentPage === "register") {
    return <RegisterSiswa onBackToLogin={() => setCurrentPage("login")} />;
  }

  // 3. Forgot Password Siswa
  if (currentPage === "forgot") {
    return <ForgotPassword onBackToLogin={() => setCurrentPage("login")} />;
  }

  // 4. Form Login
  if (currentPage === "login" || !user) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onBackToCatalog={() => setCurrentPage("catalog")}
        onOpenRegister={() => setCurrentPage("register")}
        onOpenForgot={() => setCurrentPage("forgot")}
      />
    );
  }

  // 5. Catalog OPAC (Siswa/Public)
  return (
    <Catalog
      user={user}
      onLogout={handleLogout}
      onGoToDashboard={() => setCurrentPage("dashboard")}
    />
  );
}
