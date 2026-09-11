import React, { useState } from "react";
import logo74 from "../../assets/logo74.png";
import API from "../../services/api";
import {
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function Login({
  onLoginSuccess,
  onBackToCatalog,
  onOpenRegister,
  onOpenForgot,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { username, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (onLoginSuccess) onLoginSuccess(res.data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal login, periksa koneksi server.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-primary)] flex items-center justify-center p-6 relative overflow-hidden text-slate-800">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl relative z-10 border border-slate-700/20">
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-amber-600 mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke OPAC
        </button>

        <div className="text-center mb-8">
          <img
            src={logo74}
            alt="Logo SMKN 74"
            className="h-16 w-auto mx-auto mb-3 object-contain"
          />
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            Akses Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Informasi Perpustakaan SMKN 74
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              NISN SISWA
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                placeholder="Masukkan NISN..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition text-slate-900 disabled:opacity-60"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Masukkan password..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition text-slate-900 disabled:opacity-60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              {/* Tombol Toggle Show/Hide Password */}
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

            {/* Tombol Lupa Password Khusus Siswa */}
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={onOpenForgot}
                className="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer"
              >
                Lupa Password?
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
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        {/* Link Pendaftaran Siswa */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Belum punya akun siswa?{" "}
            <button
              type="button"
              onClick={onOpenRegister}
              className="text-amber-600 font-semibold hover:underline cursor-pointer"
            >
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
