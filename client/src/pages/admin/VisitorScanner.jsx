import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../../services/api";
import {
  QrCode,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Clock,
  User,
  BookOpen,
  X,
} from "lucide-react";

export default function VisitorScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // State Kontrol Modal Popup Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Inisialisasi Daftar Kamera
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("belakang") ||
              device.label.toLowerCase().includes("environment"),
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setErrorMessage("Kamera tidak ditemukan pada perangkat ini.");
        }
      })
      .catch((err) => {
        console.error("Error getCameras:", err);
        setErrorMessage("Izin kamera ditolak atau kamera tidak tersedia.");
      });

    return () => {
      stopScanner();
    };
  }, []);

  // Mulai Scanner Otomatis saat kamera terpilih
  useEffect(() => {
    if (selectedCameraId) {
      startScanner(selectedCameraId);
    }
  }, [selectedCameraId]);

  const startScanner = async (cameraId) => {
    try {
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edgeSize = Math.floor(minEdge * 0.65);
          return { width: edgeSize, height: edgeSize };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(cameraId, config, onScanSuccess, onScanFailure);

      setIsScanning(true);
      setErrorMessage("");
    } catch (err) {
      console.error("Gagal memulai scanner:", err);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Gagal menghentikan scanner:", err);
      }
    }
  };

  // Handler saat QR Code Berhasil Ter-scan
  const onScanSuccess = async (decodedText) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setLoading(true);
      setErrorMessage("");

      let payload = {};
      try {
        const parsed = JSON.parse(decodedText);
        payload = { userId: parsed.id || parsed.userId, nisn: parsed.nisn };
      } catch (e) {
        payload = { nisn: decodedText };
      }

      const res = await API.post("/visitor-logs", payload);

      if (res.data.success) {
        setScanResult(res.data.student);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Gagal memproses absensi:", err);
      const msg =
        err.response?.data?.message ||
        "Gagal mencatat absensi. QR tidak valid.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2500);
    }
  };

  const onScanFailure = () => {
    // Frame failure
  };

  const handleSwitchCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(
      (cam) => cam.id === selectedCameraId,
    );
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 relative">
      {/* Sembunyikan TOTAL seluruh elemen border/shading bawaan html5-qrcode */}
      <style>{`
        #reader {
          border: none !important;
        }
        #reader video {
          object-fit: cover !important;
          border-radius: 1rem;
        }
        #reader__scan_region {
          border: none !important;
          background: transparent !important;
        }
        #reader__scan_region * {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
        #qr-shaded-region {
          border: none !important;
          display: none !important;
        }
        #reader__dashboard {
          display: none !important;
        }
      `}</style>

      {/* Container Scanner */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 leading-tight">
                Scan QR Absensi
              </h2>
              <p className="text-xs text-slate-500">
                Posisikan QR Code Kartu Anggota di dalam area sudut pemindai.
              </p>
            </div>
          </div>

          {cameras.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Ganti Kamera"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ganti Kamera</span>
            </button>
          )}
        </div>

        {/* Area Pemindai Kamera dengan HANYA 1 Frame Siku Persegi */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border border-slate-800 shadow-inner">
          <div id="reader" className="w-full h-full" />

          {/* SIKU PERSEGI KUSTOM TUNGGAL */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="w-[65%] aspect-square relative">
              {/* Kiri Atas */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl shadow-sm" />
              {/* Kanan Atas */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl shadow-sm" />
              {/* Kiri Bawah */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl shadow-sm" />
              {/* Kanan Bawah */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl shadow-sm" />
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs font-medium">Mencatat Absensi...</p>
            </div>
          )}
        </div>

        {/* Pesan Error */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <p className="text-xs font-medium">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* MODAL POPUP PEMBERITAHUAN BERHASIL */}
      {showSuccessModal && scanResult && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">
              Absensi Berhasil!
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Data kehadiran pengunjung telah tercatat di sistem.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-left space-y-2.5 mb-6">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                    Nama Siswa
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {scanResult.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1 border-t border-emerald-200/60">
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                    Kelas / Jurusan
                  </p>
                  <p className="text-xs font-semibold text-slate-800">
                    {scanResult.class}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                  <span className="text-[10px] uppercase font-sans font-bold text-emerald-700">
                    NISN:
                  </span>
                  <span>{scanResult.nisn}</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-200/60 px-2 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{scanResult.time}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Konfirmasi & Lanjut</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
