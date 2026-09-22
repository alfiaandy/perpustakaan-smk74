import React, { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoSekolah from "../../assets/logo74.png";
import API from "../../services/api";
import {
  Download,
  CreditCard,
  Loader2,
  X,
  ZoomIn,
  UserCheck,
  Save,
} from "lucide-react";

// List Kelas & Jurusan Seni SMKN 74 Jakarta
const LIST_KELAS = [
  "X Seni Tari",
  "X Seni Karawitan",
  "X Seni Musik",
  "X Seni Teater",
  "XI Seni Tari",
  "XI Seni Karawitan",
  "XI Seni Musik",
  "XI Seni Teater",
  "XII Seni Tari",
  "XII Seni Karawitan",
  "XII Seni Musik",
  "XII Seni Teater",
];

export default function StudentCard({ user, onUserUpdated }) {
  const cardRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ambil kelas awal dari props
  const propClass = user?.class || user?.class_major || user?.kelas || "";

  // State lokal khusus untuk pemicu re-render instan setelah simpan form
  const [submittedClass, setSubmittedClass] = useState(propClass);

  // Gabungkan kelas aktif (Prioritas: submittedClass -> propClass)
  const currentClass = submittedClass || propClass;

  // State Form Lengkapi Data Kartu
  const [classNameInput, setClassNameInput] = useState(currentClass);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Sinkronisasi state lokal saat props user dari parent berubah
  useEffect(() => {
    if (propClass) {
      setSubmittedClass(propClass);
      setClassNameInput(propClass);
    }
  }, [propClass]);

  // Cek apakah data kelas sudah terisi secara valid
  const hasClassData = Boolean(currentClass && currentClass.trim() !== "");

  // Handler Simpan Data Kelas/Jurusan
  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!classNameInput.trim()) {
      setFormError("Silakan pilih Kelas & Jurusan Anda.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const res = await API.put("/users/profile", {
        userId: user?.id,
        class_name: classNameInput.trim(),
      });

      if (res.data.success) {
        const savedClass = classNameInput.trim();

        // 1. LANGSUNG UPDATE STATE LOKAL AGAR KARTU DITAMPILKAN SEKETIKA (INSTAN)
        setSubmittedClass(savedClass);

        // 2. Ambil data user balikan dari API / gabungkan lokal
        const serverUser = res.data.user || {};
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUserData = {
          ...storedUser,
          ...user,
          ...serverUser,
          class: savedClass,
          class_major: savedClass,
          kelas: savedClass,
        };

        // 3. Simpan permanen di LocalStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // 4. Panggil callback induk jika ada untuk update state parent
        if (onUserUpdated) {
          onUserUpdated(updatedUserData);
        }
      }
    } catch (err) {
      console.error("Gagal menyimpan kelas:", err);
      setFormError(
        err.response?.data?.message || "Gagal menyimpan data. Coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Fungsi Download Kartu ke Format PDF
  const handleDownloadPDF = async () => {
    const element = cardRef.current;
    if (!element) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0f172a",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.98],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 85.6, 53.98);

      const fileName = `Kartu_Perpus_${
        user?.username || user?.nisn || "Siswa"
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Gagal mengunduh kartu:", error);
      alert(`Terjadi kesalahan saat mengunduh kartu: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const qrData = JSON.stringify({
    userId: user?.id,
    nisn: user?.username || user?.nisn,
    role: user?.role || "siswa",
  });

  // TAMPILAN 1: FORM LENGKAPI DATA KARTU (Jika Kelas Masih Kosong)
  if (!hasClassData) {
    return (
      <div className="max-w-md mx-auto bg-amber-50/60 border border-amber-200 p-6 rounded-3xl space-y-4 shadow-xs text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 font-heading">
              Lengkapi Data Kartu Digital
            </h3>
            <p className="text-xs text-slate-600">
              Pilih kelas dan jurusan kamu untuk menerbitkan Kartu Anggota
              Perpustakaan.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveClass} className="space-y-3 pt-2">
          {formError && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {formError}
            </p>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Kelas & Jurusan
            </label>
            <select
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer text-slate-800"
              required
            >
              <option value="">-- Pilih Kelas & Jurusan --</option>
              {LIST_KELAS.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !classNameInput}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Data...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan & Terbitkan Kartu</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // TAMPILAN 2: KARTU ANGGOTA DIGITAL (Jika Data Kelas Sudah Terisi)
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      {/* DESAIN KARTU ANGGOTA */}
      <div
        ref={cardRef}
        style={{
          width: "350px",
          height: "220px",
          borderRadius: "16px",
          padding: "16px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #451a03 100%)",
          color: "#ffffff",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* HEADER KARTU */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(51, 65, 85, 0.8)",
            paddingBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={logoSekolah}
              alt="Logo SMKN 74"
              style={{ height: "32px", width: "auto", objectFit: "contain" }}
            />
            <div>
              <h1
                style={{
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  lineHeight: "1",
                  margin: 0,
                }}
              >
                SMK NEGERI 74 JAKARTA
              </h1>
              <p
                style={{
                  color: "#fbbf24",
                  fontSize: "9px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "2px 0 0 0",
                }}
              >
                Kartu Anggota Perpustakaan
              </p>
            </div>
          </div>
          <CreditCard
            style={{
              color: "rgba(245, 158, 11, 0.6)",
              width: "20px",
              height: "20px",
            }}
          />
        </div>

        {/* BODY KARTU */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            margin: "auto 0",
          }}
        >
          <div style={{ flex: 1, paddingRight: "4px" }}>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: "500",
                margin: 0,
              }}
            >
              Nama Anggota
            </p>
            <h2
              style={{
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "800",
                lineHeight: "1.3",
                paddingBottom: "2px",
                margin: "2px 0 0 0",
                wordBreak: "break-words",
              }}
            >
              {user?.full_name || user?.name || "Siswa SMKN 74"}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                paddingTop: "4px",
                fontSize: "10px",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#94a3b8",
                    display: "block",
                    fontSize: "8px",
                  }}
                >
                  NISN / ID
                </span>
                <span
                  style={{
                    color: "#fcd34d",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  {user?.username || user?.nisn || "-"}
                </span>
              </div>
              <div>
                <span
                  style={{
                    color: "#94a3b8",
                    display: "block",
                    fontSize: "8px",
                  }}
                >
                  Kelas / Jurusan
                </span>
                <span style={{ color: "#e2e8f0", fontWeight: "600" }}>
                  {currentClass || "Siswa Aktif"}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              borderRadius: "12px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title="Klik untuk memperbesar QR Code"
          >
            <QRCodeSVG
              value={qrData}
              size={64}
              level="M"
              includeMargin={false}
            />
            <span
              style={{
                fontSize: "8px",
                color: "#64748b",
                marginTop: "4px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <ZoomIn style={{ width: "10px", height: "10px" }} /> Perbesar
            </span>
          </div>
        </div>

        {/* FOOTER KARTU */}
        <div
          style={{
            borderTop: "1px solid rgba(51, 65, 85, 0.8)",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "6px",
            fontSize: "8px",
          }}
        >
          <p style={{ margin: 0 }}>Berlaku Selama Menjadi Siswa Aktif</p>
          <p style={{ color: "#fbbf24", fontWeight: "600", margin: 0 }}>
            Perpustakaan Digital
          </p>
        </div>
      </div>

      {/* TOMBOL DOWNLOAD */}
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memproses Kartu PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Cetak / Download Kartu (PDF)</span>
          </>
        )}
      </button>

      {/* MODAL POP-UP QR CODE BESAR */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                QR Code Kartu Anggota
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tunjukkan QR Code ini ke petugas perpustakaan untuk di-scan.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl inline-block border border-slate-200 shadow-inner my-2">
              <QRCodeSVG
                value={qrData}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="pt-1 text-xs text-slate-600 font-medium">
              <p className="font-bold text-slate-900 text-sm">
                {user?.full_name || user?.name}
              </p>
              <p className="text-slate-500 font-mono mt-0.5">
                NISN: {user?.username || user?.nisn}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
