import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText, X } from "lucide-react";

export default function ModuleManager() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState("");
  const [filePath, setFilePath] = useState("");

  const fetchModules = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/modules")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setModules(data.data);
      })
      .catch((err) => console.error("Err fetch modules:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setTitle("");
    setAuthor("");
    setYear(new Date().getFullYear().toString());
    setCategory("");
    setFilePath("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        year,
        category: category || "Seni Tari",
        file_path: filePath,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Modul berhasil ditambahkan!");
          closeModal();
          fetchModules();
        }
      })
      .catch((err) => alert("Gagal menambah modul: " + err.message));
  };

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus modul ini?")) {
      fetch(`http://localhost:5000/api/modules/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Modul berhasil dihapus!");
            fetchModules();
          }
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" /> Repositori Modul
            Kejuruan
          </h1>
          <p className="text-xs text-slate-500">
            Kelola berkas modul & karya digital kejuruan siswa/guru
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Modul Baru
        </button>
      </div>

      {/* Tabel Modul */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Memuat data modul...
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Judul Modul / Karya</th>
                <th className="p-4">Penulis / Penyusun</th>
                <th className="p-4">Kategori & Tahun</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400">
                    Belum ada modul digital yang diunggah.
                  </td>
                </tr>
              ) : (
                modules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 max-w-md font-bold text-slate-900">
                      {item.title}
                    </td>
                    <td className="p-4 text-slate-600">{item.author}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-[10px] mr-2">
                        {item.category}
                      </span>
                      <span className="text-slate-400">{item.year}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Modul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form Modul Sesuai Desain Konsisten */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header & Close Button */}
            <div className="flex justify-between items-center pr-2">
              <h2 className="text-2xl font-bold font-heading text-slate-900">
                Tambah Modul Kejuruan
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* JUDUL MODUL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  JUDUL MODUL / KARYA
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul modul atau naskah karya..."
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                />
              </div>

              {/* PENULIS & TAHUN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    PENULIS / PENYUSUN
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Masukkan nama..."
                    className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    TAHUN TERBIT
                  </label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Contoh: 2026"
                    className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>
              </div>

              {/* KATEGORI KEJURUAN */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  KATEGORI KEJURUAN
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition text-slate-700"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Seni Tari">Seni Tari</option>
                  <option value="Seni Karawitan">Seni Karawitan</option>
                  <option value="Seni Teater">Seni Teater</option>
                  <option value="Seni Musik">Seni Musik</option>
                </select>
              </div>

              {/* FILE PATH / LINK DOKUMEN */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  LINK DOKUMEN / URL FILE (OPSIONAL)
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="Masukkan link Google Drive / URL file PDF..."
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                />
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
