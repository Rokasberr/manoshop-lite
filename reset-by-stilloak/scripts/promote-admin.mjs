import { connectDatabase } from "../server/db.js";
import User from "../server/models/User.js";
import { normalizeEmail } from "../server/utils/http.js";

const email = normalizeEmail(process.env.RESET_ADMIN_EMAIL);
if (!email) {
  console.error("Set RESET_ADMIN_EMAIL before running this script.");
  process.exit(1);
}

await connectDatabase();
const user = await User.findOneAndUpdate({ email, deletedAt: null }, { $set: { role: "admin" } }, { new: true });
if (!user) {
  console.error("No active RESET user matched RESET_ADMIN_EMAIL.");
  process.exit(1);
}
console.log(`Admin access enabled for ${user.email}.`);
process.exit(0);
