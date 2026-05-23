const DEFAULT_API_URL = 'http://localhost:4000/api';

const getApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const STORAGE_KEY = 'auth-session';
const EVENT_NAME = 'auth-session';

// --- PHẦN 1: QUẢN LÝ STATE & EVENT (Kế thừa từ Code 2) ---

const emitUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
};

export const readStoredSession = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') return null;
  const session = readStoredSession();
  return session?.accessToken || session?.token || localStorage.getItem('token');
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    const parsed = user ? JSON.parse(user) : null;
    if (parsed) {
      console.log("getStoredUser():", parsed);
      return parsed;
    }

    const session = readStoredSession();
    if (session?.user) {
      console.log("getStoredUser():", session.user);
      return session.user;
    }

    console.log("getStoredUser():", parsed);
    return null;
  } catch {
    return null;
  }
};

export const storeSession = (state) => {
  if (typeof window === 'undefined') return;
  if (state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const accessToken = state.accessToken || state.token;
    if (accessToken) localStorage.setItem('token', accessToken);
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
      console.log("Saved user to localStorage:", state.user);
    }
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  emitUpdate();
};

export const clearSession = () => {
  storeSession(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const onSessionChange = (handler) => {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
};

// --- PHẦN 2: REQUEST WRAPPER LINH HOẠT ---

const request = async (path, init = {}, token = null, retryOnUnauthorized = true) => {
  // Gộp header mặc định, header auth và custom header
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include', // Giữ nguyên tùy chọn gửi cookie (nếu có) từ Code 2
    ...init,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null; // Xử lý trường hợp API không trả về JSON
  }

  // Bắt lỗi HTTP Status (ví dụ 401, 500)
  if (!response.ok) {
    if (response.status === 401 && retryOnUnauthorized && path !== '/auth/refresh' && path !== '/auth/login') {
      try {
        const refreshed = await refreshSession();
        return request(path, init, refreshed?.accessToken, false);
      } catch {
        clearSession();
      }
    }

    const message = payload?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  // Đảm bảo có dữ liệu
  if (!payload) {
    throw new Error("Response is empty or not valid JSON");
  }

  // Tuân thủ kiến trúc ApiEnvelope của Code 2: Trả về payload.data
  // (Fallback về payload nếu backend Code 1 trả thẳng data ra ngoài)
  return payload.data !== undefined ? payload.data : payload;
};

// --- PHẦN 3: API CỦA CODE 1 VIẾT THEO STYLE MỚI ---

export const registerUser = async (payload) => {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};

export const loginUser = async (payload) => {
  // payload: { email, password }
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  // Áp dụng workflow của Code 2: Tự động lưu session sau khi login thành công
  storeSession(data);
  return data;
};

export const logoutUser = async () => {
  try {
    await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    }, getStoredAccessToken(), false);
  } finally {
    clearSession();
  }
};

export const refreshSession = async () => {
  const data = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  }, null, false);

  const current = readStoredSession() || {};
  storeSession({ ...current, accessToken: data.accessToken, sessionId: data.sessionId });
  return data;
};

export const mockForgotPassword = async (email) => {
  return request('/auth/forgot-password', {
    method: 'POST', // Rút kinh nghiệm từ Code 2, định nghĩa rõ method
    body: JSON.stringify({ email }),
  });
};

export const getCurrentUser = async () => {
  return request('/auth/me', {}, getStoredAccessToken());
};

export const updateCurrentUser = async (payload) => {
  const user = await request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, getStoredAccessToken());

  const session = readStoredSession();
  if (session) {
    storeSession({ ...session, user });
  }

  return user;
};

export const changeCurrentUserPassword = async (payload) => {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, getStoredAccessToken());
};
