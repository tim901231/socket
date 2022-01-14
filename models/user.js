import mongoose from "mongoose";
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  userId: String,
  password: String,
  email: String,
  status: String,
  gameId: String,
  friend: [String],
});
const AppendingUserSchema = new Schema({
  userId: String,
  password: String,
  email: String,
  status: String,
  gameId: String,
  secretToken: String,
  active: Boolean,
});
const User = mongoose.model("User", UserSchema);
const AppendingUser = mongoose.model("AppendingUser", AppendingUserSchema);
export { User, AppendingUser };
