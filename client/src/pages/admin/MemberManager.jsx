import React, { useState, useEffect } from "react";
import API from "../../services/api";
import {
  Users,
  Search,
  Trash2,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";

export default function MemberManager() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE PAGINASI (MAX 10 LIST PER HALAMAN) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State Modal Konfirmasi Hapus
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: "",
  });

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/users/students");
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data anggota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset ke halaman 1 setiap kali search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Buka Pop-up Hapus
  const openDeleteModal = (id, name) => {
    setDeleteModal({
      isOpen: true,
      memberId: id,
      memberName: name,
    });
  };

  // Tutup Pop-up Hapus
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      memberId: null,
      memberName: "",
    });
  };

  // Eksekusi Hapus Siswa
  const confirmDelete = async () => {
    if (!deleteModal.memberId) return;

    try {
      const res = await API.delete(`/users/students/${deleteModal.memberId}`);
      if (res.data.success) {
        fetchMembers();
        closeDeleteModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus siswa");
    }
  };

  // Filter Data Berdasarkan Kata Kunci Pencarian
  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.username?.toLowerCase().includes(search.toLowerCase()),
  );

  // --- LOGIKA PERHITUNGAN PAGINASI ---
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const startResult = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endResult = Math.min(indexOfLastItem, totalItems);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center">
              <Users className="w-7 h-7 mr-2.5 text-amber-600" /> Kelola Data
              Anggota Siswa
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {filteredMembers.length} Siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh siswa yang terdaftar dalam sistem perpustakaan SMKN
            74
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari nama atau NISN..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-600 shadow-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Table Data Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 w-16">No</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">NISN / Username</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Memuat data anggota...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Tidak ada data anggota siswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentMembers.map((m, index) => (
                  <tr
                    key={m.id || index}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="p-4 font-semibold text-slate-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-900 capitalize">
                      {m.full_name}
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {m.username}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <ShieldCheck className="w-3 h-3 mr-1 text-amber-600" />{" "}
                        Siswa
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openDeleteModal(m.id, m.full_name)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer inline-flex items-center"
                        title="Hapus Anggota"
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

        {/* FOOTER TABEL & PAGINASI */}
        {!loading && totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {startResult} - {endResult} dari {totalItems} Siswa
            </p>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-3 h-8 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                    currentPage === totalPages
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-amber-700 border-slate-200 hover:bg-amber-50"
                  }`}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL POP-UP KONFIRMASI HAPUS */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative text-center space-y-4">
            {/* Tombol Close Top Right */}
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Warning */}
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Text Message */}
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Hapus Akun Siswa?
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun siswa{" "}
                <strong className="text-slate-800 capitalize">
                  "{deleteModal.memberName}"
                </strong>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Tombol Aksi */}
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
                className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
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
