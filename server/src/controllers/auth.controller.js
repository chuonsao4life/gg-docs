import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const {
  JWT_SECRET = "change-me-in-env",
  JWT_EXPIRES_IN = "15m",
  REFRESH_TOKEN_EXPIRES_IN_DAYS = "7",
  SALT_ROUNDS = "10",
} = process.env;

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const SESSION_ID_COOKIE = "sessionId";
const refreshTokenMaxAgeMs = Number(REFRESH_TOKEN_EXPIRES_IN_DAYS) * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

function ok(res, status, message, data) {
  return res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
  });
}

function fail(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar ?? null,
    createdAt: user.createdAt,
  };
}

function signAccessToken(user, sessionId) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, sessionId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function signRefreshToken(user, sessionId) {
  return jwt.sign(
    { id: user.id, sessionId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d` },
  );
}

async function createSession(user) {
  const expireAt = new Date(Date.now() + refreshTokenMaxAgeMs);
  const session = await prisma.session.create({
    data: {
      userID: user.id,
      expireAt,
      hashedRefreshToken: "pending",
    },
  });
  const refreshToken = signRefreshToken(user, session.id);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, Number(SALT_ROUNDS));

  await prisma.session.update({
    where: { id: session.id },
    data: { hashedRefreshToken },
  });

  return {
    session: { ...session, hashedRefreshToken, expireAt },
    refreshToken,
    accessToken: signAccessToken(user, session.id),
  };
}

function setAuthCookies(res, { accessToken, refreshToken, sessionId }) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
  });

  if (refreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAgeMs,
    });
  }

  if (sessionId) {
    res.cookie(SESSION_ID_COOKIE, sessionId, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAgeMs,
    });
  }
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
  res.clearCookie(SESSION_ID_COOKIE, cookieOptions);
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1] || null;
}

function getAccessToken(req) {
  return req.cookies?.[ACCESS_TOKEN_COOKIE] || getBearerToken(req);
}

function getAuthUser(req) {
  const token = getAccessToken(req);
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getRefreshPayload(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    return payload?.type === "refresh" ? payload : null;
  } catch {
    return null;
  }
}

async function findValidSession(refreshToken) {
  const payload = getRefreshPayload(refreshToken);
  if (!payload?.sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expireAt <= new Date()) return null;

  const tokenMatches = await bcrypt.compare(refreshToken, session.hashedRefreshToken);
  return tokenMatches ? session : null;
}

async function passwordMatches(user, { password, hashedPassword }) {
  if (hashedPassword && user.hashedPassword === hashedPassword) return true;
  if (!password) return false;

  try {
    return await bcrypt.compare(password, user.hashedPassword);
  } catch {
    return false;
  }
}

export const signup = async (req, res) => {
  try {
    const { email, password, hashedPassword, username, lastname, firstname } = req.body;

    if (!email || (!hashedPassword && !password) || !username || !lastname || !firstname) {
      return fail(res, 400, "Missing input.");
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return fail(res, 409, "Email/username exists.");
    }

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword: hashedPassword || await bcrypt.hash(password, Number(SALT_ROUNDS)),
        username,
        lastname,
        firstname,
      },
    });

    const { session, accessToken, refreshToken } = await createSession(user);
    setAuthCookies(res, { accessToken, refreshToken, sessionId: session.id });

    return ok(res, 201, "Account created successfully", {
      user: formatUser(user),
    });
  } catch (err) {
    console.error("[signup] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password, hashedPassword } = req.body;

    if ((!username && !email) || (!hashedPassword && !password)) {
      return fail(res, 400, "Missing input.");
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });
    if (!user || !(await passwordMatches(user, { password, hashedPassword }))) {
      return fail(res, 401, "Incorrect username/password.");
    }

    const { session, accessToken, refreshToken } = await createSession(user);
    setAuthCookies(res, { accessToken, refreshToken, sessionId: session.id });

    return ok(res, 200, "Login successful", {
      user: formatUser(user),
      accessToken,
    });
  } catch (err) {
    console.error("[login] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const sessionId = req.cookies?.[SESSION_ID_COOKIE] || getRefreshPayload(refreshToken)?.sessionId;

    if (!refreshToken || !sessionId) {
      return fail(res, 401, "Token not found in cookie.");
    }

    await prisma.session.deleteMany({ where: { id: sessionId } });
    clearAuthCookies(res);

    return ok(res, 200, "Logged out successfully");
  } catch (err) {
    console.error("[logout] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return fail(res, 401, "Token not found in cookie.");
    }

    const session = await findValidSession(refreshToken);
    if (!session) {
      clearAuthCookies(res);
      return fail(res, 403, "Refresh token expired or invalid.");
    }

    const accessToken = signAccessToken(session.user, session.id);
    setAuthCookies(res, { accessToken });

    return ok(res, 200, undefined, {
      accessToken,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[refresh] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const getMe = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return fail(res, 401, "Please sign in.");
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return fail(res, 404, "User not found.");
    }

    return ok(res, 200, undefined, formatUser(user));
  } catch (err) {
    console.error("[getMe] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const updateMe = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return fail(res, 401, "Please sign in.");
    }

    const firstname = String(req.body.firstname || "").trim();
    const lastname = String(req.body.lastname || "").trim();
    const username = String(req.body.username || "").trim();
    const avatar = req.body.avatar === null ? null : String(req.body.avatar || "").trim();

    if (!firstname || !lastname || !username) {
      return fail(res, 400, "Firstname, lastname and username are required.");
    }

    const existing = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: authUser.id },
      },
    });

    if (existing) {
      return fail(res, 409, "Username is already in use.");
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

    return ok(res, 200, undefined, formatUser(user));
  } catch (err) {
    console.error("[updateMe] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const changePassword = async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser?.id) {
      return fail(res, 401, "Please sign in.");
    }

    const { currentPassword, currentHashedPassword, newPassword, newHashedPassword } = req.body;
    if ((!currentPassword && !currentHashedPassword) || (!newPassword && !newHashedPassword)) {
      return fail(res, 400, "Current password and new password are required.");
    }

    if (newPassword && String(newPassword).length < 6) {
      return fail(res, 400, "New password must be at least 6 characters long.");
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      return fail(res, 404, "User not found.");
    }

    if (!(await passwordMatches(user, { password: currentPassword, hashedPassword: currentHashedPassword }))) {
      return fail(res, 401, "Current password is not correct.");
    }

    const nextHashedPassword = newHashedPassword || await bcrypt.hash(newPassword, Number(SALT_ROUNDS));
    await prisma.user.update({
      where: { id: authUser.id },
      data: { hashedPassword: nextHashedPassword },
    });

    return ok(res, 200, undefined, { ok: true });
  } catch (err) {
    console.error("[changePassword] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return fail(res, 400, "Email is required.");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.log(`[forgotPassword] Mock reset link generated for ${email}`);
    }

    return ok(res, 200, "If the email matches an account, a reset link has been sent.");
  } catch (err) {
    console.error("[forgotPassword] error:", err);
    return fail(res, 500, "Internal server error.");
  }
};
