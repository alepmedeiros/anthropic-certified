const BASE = "/api";

function getToken() {
  return localStorage.getItem("ccarf-token");
}

export function setToken(token) {
  if (token) localStorage.setItem("ccarf-token", token);
  else localStorage.removeItem("ccarf-token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getDomains: () => request("/domains"),
  getQuestions: (domainId) => request(`/questions?domain=${encodeURIComponent(domainId)}`),
  getFullExam: () => request("/exam/full"),
  startAttempt: (mode, domainId) =>
    request("/exam/attempt", { method: "POST", body: JSON.stringify({ mode, domain_id: domainId }) }),
  answer: (attemptId, questionId, choice) =>
    request(`/exam/attempt/${attemptId}/answer`, {
      method: "POST",
      body: JSON.stringify(
        Array.isArray(choice)
          ? { question_id: questionId, chosen_options: choice }
          : { question_id: questionId, chosen_option: choice }
      ),
    }),
  finish: (attemptId) => request(`/exam/attempt/${attemptId}/finish`, { method: "POST" }),
  getProgress: () => request("/progress"),
};
