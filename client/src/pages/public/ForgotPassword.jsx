import React, { useState } from "react";
import API from "../../services/api";
import logo74 from "../../assets/logo74.png";
import {
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function ForgotPassword({ onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Validasi Kekuatan Password Baru
    const passwordCheck = validatePasswordComplexity(newPassword);
    if (!passwordCheck.isValid) {
      setError(
        "Password baru wajib mengandung minimal 1 Huruf Besar, 1 Huruf Kecil, 1 Angka, dan 1 Simbol Khusus (!@#$%^&*).",
      );
      return;
    }

    // 2. Validasi Konfirmasi Password
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", {
        username,
        new_password: newPassword,
      });

      if (res.data.success) {
        setSuccess(res.data.message);
        setUsername("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-primary)] flex items-center justify-center p-6 text-slate-800">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-700/20">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-amber-600 mb-6 cursor-pointer transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
        </button>

        <div className="text-center mb-6">
          <img
            src={logo74}
            alt="Logo SMKN 74"
            className="h-14 w-auto mx-auto mb-2 object-contain"
          />
          <h2 className="text-xl font-bold font-heading text-slate-900">
            Reset Password Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Layanan Mandiri Lupa Password Anggota Siswa
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-10">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username / NISN Siswa
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                placeholder="Masukkan NISN / Username Siswa..."
                className="w-full pl-10 pr-4 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-900 disabled:opacity-60"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Buat password baru..."
                className="w-full pl-10 pr-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-900 disabled:opacity-60"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                {showNewPassword ? (
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
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Ketik ulang password baru..."
                className="w-full pl-10 pr-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white text-slate-900 disabled:opacity-60"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full bg-slate-900 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Simpan Password Baru</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
