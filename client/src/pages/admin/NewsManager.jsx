import React, { useState, useEffect } from "react";
import { Plus, Trash2, Newspaper, Image as ImageIcon, X } from "lucide-react";

export default function NewsManager() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchNews = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.data);
      })
      .catch((err) => console.error("Err fetch news:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle("");
    setCategory("");
    setExcerpt("");
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category || "Kegiatan");
    formData.append("excerpt", excerpt);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    fetch("http://localhost:5000/api/news", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Berita berhasil ditambahkan!");
          closeModal();
          fetchNews();
        } else {
          alert("Gagal: " + data.message);
        }
      })
      .catch((err) => alert("Gagal menambah berita: " + err.message));
  };

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus berita ini?")) {
      fetch(`http://localhost:5000/api/news/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Berita berhasil dihapus!");
            fetchNews();
          }
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-amber-600" /> Kelola Berita &
            Pengumuman
          </h1>
          <p className="text-xs text-slate-500">
            Atur konten informasi landing page sekolah
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Berita Baru
        </button>
      </div>

      {/* Tabel Berita */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Memuat data berita...
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Info Berita</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Tanggal Publikasi</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {news.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400">
                    Belum ada berita yang ditambahkan.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 max-w-md">
                      <div className="font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.excerpt}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Berita"
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

      {/* Modal Form Sesuai Desain Konsisten */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header & Close Button */}
            <div className="flex justify-between items-center pr-2">
              <h2 className="text-2xl font-bold font-heading text-slate-900">
                Tambah Berita Baru
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* GAMBAR / SAMPUL BERITA */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  SAMPUL BERITA (FOTO)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200/60 cursor-pointer transition w-fit">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400">
                      {imageFile ? imageFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              {/* JUDUL BERITA */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  JUDUL BERITA
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul berita..."
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                />
              </div>

              {/* KATEGORI BERITA */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  KATEGORI BERITA
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition text-slate-700"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Pengumuman">Pengumuman</option>
                  <option value="Layanan">Layanan</option>
                </select>
              </div>

              {/* RINGKASAN BERITA */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  RINGKASAN / DESKRIPSI BERITA
                </label>
                <textarea
                  required
                  rows="4"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Masukkan ringkasan atau isi singkat berita..."
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                ></textarea>
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
                  Simpan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
