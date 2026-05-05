import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const { JWT_SECRET = "change-me-in-env", JWT_EXPIRES_IN = "7d", SALT_ROUNDS = 10 } = process.env;

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1] || null;
}

function getAuthUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

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
    const { hashedPassword: _hashedPassword, ...safeUser } = user;

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

export const getMe = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in." });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ data: formatUser(user) });
  } catch (err) {
    console.error("[getMe] error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateMe = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in." });
    }

    const firstname = String(req.body.firstname || "").trim();
    const lastname = String(req.body.lastname || "").trim();
    const username = String(req.body.username || "").trim();
    const avatar = req.body.avatar === null ? null : String(req.body.avatar || "").trim();

    if (!firstname || !lastname || !username) {
      return res.status(400).json({ message: "Firstname, lastname and username are required." });
    }

    const existing = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: authUser.id },
      },
    });

    if (existing) {
      return res.status(409).json({ message: "Username is already in use." });
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        firstname,
        lastname,
        username,
        avatar: avatar || null,
      },
    });

    return res.json({ data: formatUser(user) });
  } catch (err) {
    console.error("[updateMe] error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return res.status(401).json({ message: "Please sign in." });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is not correct." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: authUser.id },
      data: { hashedPassword },
    });

    return res.json({ data: { ok: true } });
  } catch (err) {
    console.error("[changePassword] error:", err);
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
