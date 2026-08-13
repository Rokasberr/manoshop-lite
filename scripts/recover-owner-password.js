#!/usr/bin/env node
const path = require("path");
const readline = require("readline");

const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const User = require("../server/models/User");
const { getPasswordPolicyError, isValidEmail, normalizeEmail } = require("../server/utils/authInput");

dotenv.config({ path: path.resolve(__dirname, "..", "server", ".env") });

const usage = [
  "Usage:",
  "  npm run owner:recover-password -- --target-email=owner@example.com --confirm-email=owner@example.com",
  "",
  "Safety:",
  "  Do not pass passwords as command-line arguments.",
  "  The new password is read from a hidden prompt when run in a TTY.",
].join("\n");

const parseArgs = (argv) => {
  const args = {};

  for (const item of argv) {
    if (item === "--help" || item === "-h") {
      args.help = true;
      continue;
    }

    if (item.startsWith("--password") || item.startsWith("-p")) {
      throw new Error("Password arguments are not supported. Use the hidden stdin prompt.");
    }

    const match = item.match(/^--([^=]+)=(.*)$/);

    if (match) {
      args[match[1]] = match[2];
    }
  }

  return args;
};

const getDatabaseNameFromUri = (mongoUri) => {
  try {
    const parsedUri = new URL(mongoUri);
    return parsedUri.pathname.replace(/^\/+/, "").split("/")[0] || "";
  } catch (_error) {
    return "";
  }
};

const resolveDatabaseName = () => {
  const mongoUri = process.env.MONGO_URI || "";
  const envDatabaseName = String(process.env.MONGO_DB_NAME || "").trim();
  const uriDatabaseName = getDatabaseNameFromUri(mongoUri);

  if (!mongoUri) {
    throw new Error("MONGO_URI is required.");
  }

  if (envDatabaseName && uriDatabaseName && envDatabaseName !== uriDatabaseName) {
    throw new Error("Target database is ambiguous: MONGO_DB_NAME and MONGO_URI path do not match.");
  }

  const databaseName = envDatabaseName || uriDatabaseName;

  if (!databaseName) {
    throw new Error("Target database is ambiguous: set MONGO_DB_NAME or include a database name in MONGO_URI.");
  }

  return databaseName;
};

const readHiddenLine = (prompt) =>
  new Promise((resolve) => {
    const input = process.stdin;
    const output = process.stdout;
    const rl = readline.createInterface({ input, output });
    const write = output.write.bind(output);

    output.write(prompt);
    input.setRawMode(true);
    input.resume();

    let value = "";

    input.on("data", function onData(char) {
      const text = char.toString("utf8");

      if (text === "\u0003") {
        output.write("\n");
        process.exit(130);
      }

      if (text === "\r" || text === "\n") {
        input.setRawMode(false);
        input.removeListener("data", onData);
        rl.close();
        output.write("\n");
        resolve(value);
        return;
      }

      if (text === "\u0008" || text === "\u007f") {
        value = value.slice(0, -1);
        return;
      }

      value += text;
      write("*");
    });
  });

const readStdinLines = () =>
  new Promise((resolve) => {
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8").split(/\r?\n/)));
  });

const readNewPassword = async () => {
  const [first, second] = process.stdin.isTTY
    ? [await readHiddenLine("New password: "), await readHiddenLine("Repeat new password: ")]
    : await readStdinLines();

  if (first !== second) {
    throw new Error("Passwords do not match.");
  }

  const passwordError = getPasswordPolicyError(first);

  if (passwordError) {
    throw new Error(passwordError);
  }

  return first;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage);
    return;
  }

  const targetEmail = normalizeEmail(args["target-email"]);
  const confirmEmail = normalizeEmail(args["confirm-email"]);

  if (!isValidEmail(targetEmail)) {
    throw new Error("Provide --target-email with a valid owner email.");
  }

  if (confirmEmail !== targetEmail) {
    throw new Error("Confirmation failed: --confirm-email must exactly match --target-email.");
  }

  const databaseName = resolveDatabaseName();
  console.log(`Selected MongoDB database: ${databaseName}`);
  console.log(`Target email confirmed: ${targetEmail}`);

  const newPassword = await readNewPassword();

  await mongoose.connect(process.env.MONGO_URI, { dbName: databaseName });

  try {
    const user = await User.findOne({ email: targetEmail }).select("+password");

    if (!user) {
      throw new Error("Target user was not found. No changes were made.");
    }

    user.password = newPassword;
    user.passwordResetTokenHash = "";
    user.passwordResetExpiresAt = null;
    user.authVersion = Number(user.authVersion || 0) + 1;
    user.passwordChangedAt = new Date();
    await user.save();

    if (!(await bcrypt.compare(newPassword, user.password))) {
      throw new Error("Password verification failed after save.");
    }

    console.log("Owner password was updated and existing sessions were invalidated.");
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  main().catch(async (error) => {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close().catch(() => {});
    }

    console.error(`Owner recovery failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  parseArgs,
  resolveDatabaseName,
};
