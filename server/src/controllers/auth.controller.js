import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const { JWT_SECRET = "change-me-in-env", JWT_EXPIRES_IN = "7d", SALT_ROUNDS = 10 } = process.env;

/**
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, username, firstname, lastname } = req.body;

    // Basic validation
    if (!email || !password || !username || !firstname || !lastname) {
      return res.status(400).json({
        message:
          "All fields (email, password, username, firstname, lastname) are required.",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    // Check duplicates (email OR username)
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      const conflictField = existing.email === email ? "Email" : "Username";
      return res
        .status(409)
        .json({ message: `${conflictField} is already in use.` });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstname,
        lastname,
        hashedPassword: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        createdAt: true,
      },
    });
    console.log(user);
    return res.status(201).json({
      message: "Account created successfully.",
      user,
    });
  } catch (err) {
    console.error("[register] error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);  
    console.log(passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
// shorten form of jwt.sign: sign(payload)
    // Strip password from response
    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
      message: "Logged in successfully.",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * POST /api/auth/forgot-password (MOCK)
 * Does NOT send an actual email. Just verifies email existence.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // For security, return the same generic message whether or not the user exists.
    // (Prevents user enumeration.)
    if (!user) {
      return res.status(200).json({
        message: "If the email matches an account, a reset link has been sent.",
      });
    }

    // MOCK: pretend we sent an email
    console.log(`[forgotPassword] Mock reset link generated for ${email}`);

    return res.status(200).json({
      message: "Password reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("[forgotPassword] error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
