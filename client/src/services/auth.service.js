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

export const storeSession = (state) => {
  if (typeof window === 'undefined') return;
  if (state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

const request = async (path, init = {}, token = null) => {
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
  // payload: { email, password, username, firstname, lastname }
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

export const mockForgotPassword = async (email) => {
  return request('/auth/forgot-password', {
    method: 'POST', // Rút kinh nghiệm từ Code 2, định nghĩa rõ method
    body: JSON.stringify({ email }),
  });
};

export const getCurrentUser = async () => {
  const session = readStoredSession();
  return request('/auth/me', {}, session?.token);
};

export const updateCurrentUser = async (payload) => {
  const session = readStoredSession();
  const user = await request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, session?.token);

  if (session) {
    storeSession({ ...session, user });
    localStorage.setItem('user', JSON.stringify(user));
  }

  return user;
};

export const changeCurrentUserPassword = async (payload) => {
  const session = readStoredSession();
  return request('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, session?.token);
};
