import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Plus, Edit2, Trash2, User, X, Image } from "lucide-react";

export default function LibrarianManager() {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [formData, setFormData] = useState({ name: "", role: "", photo: null });
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      const res = await API.get("/librarians");
      setLibrarians(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data tim pustakawan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const handleOpenModal = (data = null) => {
    setModal({ isOpen: true, data });
    if (data) {
      setFormData({ name: data.name, role: data.role, photo: null });
      setPreviewPhoto(
        data.photo
          ? `http://localhost:5000/uploads/librarians/${data.photo}`
          : null,
      );
    } else {
      setFormData({ name: "", role: "", photo: null });
      setPreviewPhoto(null);
    }
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, data: null });
    setFormData({ name: "", role: "", photo: null });
    setPreviewPhoto(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      if (modal.data) {
        await API.put(`/librarians/${modal.data.id}`, data);
      } else {
        await API.post("/librarians", data);
      }
      fetchLibrarians();
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal menyimpan data.";
      alert(`Gagal menyimpan data: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pustakawan ini?"))
      return;
    try {
      await API.delete(`/librarians/${id}`);
      fetchLibrarians();
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-800">
            Manajemen Tim Pustakawan
          </h2>
          <p className="text-xs text-slate-500">
            Kelola profil staf perpustakaan yang tampil di halaman depan.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Staf
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-400 py-10">
          Memuat data...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {librarians.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center relative group bg-slate-50"
            >
              <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden mb-3 border-2 border-white shadow-sm flex items-center justify-center">
                {item.photo ? (
                  <img
                    src={`http://localhost:5000/uploads/librarians/${item.photo}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
              <p className="text-xs text-amber-600 font-medium mb-4">
                {item.role}
              </p>

              <div className="flex gap-2 w-full pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {modal.data ? "Edit Profil Staf" : "Tambah Staf Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Hj. Ratna Sari, M.Pd"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Contoh: Kepala Perpustakaan"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* AREA UPLOAD FOTO PROFIL TERBARU */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Foto Profil
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    {previewPhoto ? (
                      <img
                        src={previewPhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition group">
                    <Image className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-amber-600 transition truncate max-w-[180px]">
                      {formData.photo
                        ? formData.photo.name
                        : "Pilih Foto Profil"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
