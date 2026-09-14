import React, { useState, useEffect } from "react";
import API from "../../services/api";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  BookOpen,
  AlertTriangle,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function BookManager() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State Foto Sampul & Preview
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // State Modal Konfirmasi Hapus
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bookId: null,
    bookTitle: "",
  });

  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    year_published: 2024,
    total_stock: 1,
    rack_location: "",
    category_id: "",
    description: "",
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/books?search=${search}`);
      setBooks(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data buku", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("books/categories");
      setCategories(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data kategori", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Pilih File Foto Sampul
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Bungkus data ke dalam FormData agar file gambar terkirim
    const data = new FormData();
    data.append("isbn", formData.isbn);
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("publisher", formData.publisher);
    data.append("year_published", formData.year_published);
    data.append("total_stock", formData.total_stock);
    data.append("available_stock", formData.total_stock);
    data.append("rack_location", formData.rack_location);
    data.append("category_id", formData.category_id);
    data.append("description", formData.description); // <-- Tambahkan ini
    if (coverFile) {
      data.append("cover_image", coverFile);
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingId) {
        await API.put(`/books/${editingId}`, data, config);
      } else {
        await API.post("/books", data, config);
      }

      setIsModalOpen(false);
      resetForm();
      fetchBooks();
    } catch (err) {
      console.error("Error submit book:", err.response?.data);
      alert(
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan data",
      );
    }
  };

  const openDeleteModal = (id, title) => {
    setDeleteModal({
      isOpen: true,
      bookId: id,
      bookTitle: title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      bookId: null,
      bookTitle: "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.bookId) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/books/${deleteModal.bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
      closeDeleteModal();
    } catch (err) {
      alert("Gagal menghapus buku");
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setFormData({
      isbn: book.isbn || "",
      title: book.title || "",
      author: book.author || "",
      publisher: book.publisher || "",
      year_published: book.year_published || 2024,
      total_stock: book.total_stock || 1,
      rack_location: book.rack_location || "",
      category_id: book.category_id || "",
      description: book.description || "",
    });
    setCoverFile(null);
    setCoverPreview(
      book.cover_image
        ? `http://localhost:5000/uploads/${book.cover_image}`
        : null,
    );
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setCoverFile(null);
    setCoverPreview(null);
    setFormData({
      isbn: "",
      title: "",
      author: "",
      publisher: "",
      year_published: 2024,
      total_stock: 1,
      rack_location: "",
      category_id: "",
      description: "",
    });
  };

  return (
    <div className="space-y-6 relative text-slate-800">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center">
              <BookOpen className="w-7 h-7 mr-2.5 text-amber-600" /> Manajemen
              Data Buku
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {books.length} Judul
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data koleksi buku perpustakaan SMKN 74
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-md cursor-pointer transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Buku
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Cari judul, penulis, ISBN..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {/* Table Buku */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Sampul</th>
              <th className="p-4">ISBN</th>
              <th className="p-4">Judul Buku</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Penulis</th>
              <th className="p-4">Stok (Tersedia / Total)</th>
              <th className="p-4">Lokasi Rak</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400">
                  Memuat data buku...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400">
                  Tidak ada koleksi buku yang ditemukan.
                </td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    {b.cover_image ? (
                      <img
                        src={`http://localhost:5000/uploads/${b.cover_image}`}
                        alt={b.title}
                        className="w-10 h-14 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {b.isbn || "-"}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{b.title}</td>
                  <td className="p-4 font-semibold text-amber-700">
                    {b.category_name || b.category || "-"}
                  </td>
                  <td className="p-4 text-slate-600">{b.author}</td>
                  <td className="p-4 font-semibold">
                    <span className="text-emerald-600">
                      {b.available_stock ?? b.total_stock}
                    </span>{" "}
                    / {b.total_stock}
                  </td>
                  <td className="p-4 text-slate-600">
                    {b.rack_location || "-"}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition cursor-pointer inline-flex items-center"
                      title="Edit Buku"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(b.id, b.title)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer inline-flex items-center"
                      title="Hapus Buku"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM TAMBAH/EDIT BUKU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold font-heading text-slate-900 mb-4">
              {editingId ? "Edit Data Buku" : "Tambah Buku Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* INPUT FILE FOTO SAMPUL BUKU */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sampul Buku (Foto)
                </label>
                <div className="flex items-center gap-3">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-14 h-20 object-cover rounded-xl border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nomor ISBN..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.isbn}
                  onChange={(e) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Buku
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul buku..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sinopsis / Deskripsi Buku
                </label>
                <textarea
                  rows="3"
                  placeholder="Masukkan sinopsis atau ringkasan isi buku..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* DROPDOWN KATEGORI BUKU */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Buku
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900 cursor-pointer"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Penulis / Pengarang
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama penulis..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Penerbit
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama penerbit..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.publisher}
                  onChange={(e) =>
                    setFormData({ ...formData, publisher: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Terbit
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                    value={formData.year_published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year_published: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Stok
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                    value={formData.total_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, total_stock: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lokasi Rak
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rak A-02"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                  value={formData.rack_location}
                  onChange={(e) =>
                    setFormData({ ...formData, rack_location: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-md shadow-amber-200 cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL POP-UP KONFIRMASI HAPUS */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative text-center space-y-4">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Hapus Buku Ini?
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus buku{" "}
                <strong className="text-slate-800">
                  "{deleteModal.bookTitle}"
                </strong>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-rose-200 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
