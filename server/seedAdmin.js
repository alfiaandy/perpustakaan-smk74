const db = require("./config/db");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    // 1. Hapus admin lama jika ada
    await db.query("DELETE FROM users WHERE username = 'admin'");

    // 2. Hash password 'admin123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // 3. Insert admin baru
    await db.query(
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
      ["admin", hashedPassword, "Administrator Utama", "admin"],
    );

    console.log("✅ BERHASIL: Akun admin baru berhasil dibuat!");
    console.log("👉 Username: admin");
    console.log("👉 Password: admin123");
    process.exit();
  } catch (error) {
    console.error("❌ GAGAL:", error.message);
    process.exit(1);
  }
}

seedAdmin();
