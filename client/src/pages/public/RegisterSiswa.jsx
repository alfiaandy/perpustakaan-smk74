import React, { useState } from "react";
import API from "../../services/api";
import logo74 from "../../assets/logo74.png";
import {
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function RegisterSiswa({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper fungsi untuk memvalidasi kekuatan format password
  const validatePasswordComplexity = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    return {
      isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Validasi Kekuatan Password
    const passwordCheck = validatePasswordComplexity(formData.password);
    if (!passwordCheck.isValid) {
      setError(
        "Password wajib mengandung minimal 1 Huruf Besar, 1 Huruf Kecil, 1 Angka, dan 1 Simbol Khusus (!@#$%^&*).",
      );
      return;
    }

    // 2. Validasi Konfirmasi Password
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok dengan password!");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        role: "siswa",
      });

      if (res.data.success) {
        setSuccess("Pendaftaran berhasil! Silakan kembali dan login.");
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          full_name: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mendaftar akun siswa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-primary)] flex items-center justify-center p-6 relative overflow-hidden text-slate-800">
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl relative z-10 border border-slate-700/20">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-amber-600 mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
        </button>

        <div className="text-center mb-6">
          <img
            src={logo74}
            alt="Logo SMKN 74"
            className="h-14 w-auto mx-auto mb-3 object-contain"
          />
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            Registrasi Akun Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Informasi Perpustakaan SMKN 74
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                placeholder="Masukkan nama lengkap siswa..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition text-slate-900 disabled:opacity-60"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username / NISN
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                placeholder="Masukkan Username / NISN..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition text-slate-900 disabled:opacity-60"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Buat password akun..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition text-slate-900 disabled:opacity-60"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
              * Wajib mengandung: 1 Huruf Besar, 1 Huruf Kecil, 1 Angka, dan 1
              Simbol Khusus (!@#$%^&*).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Ketik ulang password..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition text-slate-900 disabled:opacity-60"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl text-xs transition duration-300 shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
