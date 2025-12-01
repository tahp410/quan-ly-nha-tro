const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "ADMIN" }
  },
  { timestamps: true }
);

// --- SỬA LẠI ĐOẠN NÀY ---
// Bỏ tham số "next" đi, vì dùng async/await thì không cần next nữa
UserSchema.pre("save", async function () {
  // Nếu mật khẩu không bị sửa đổi thì bỏ qua
  if (!this.isModified("password")) return;

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// ------------------------

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);