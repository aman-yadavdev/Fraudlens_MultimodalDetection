const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getToken() {
	return localStorage.getItem("fraudlens_token");
}

function getAuthHeaders() {
	const token = getToken();
	return {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}

function parseJsonOrThrow(res, fallbackMessage) {
	return res.json().catch(() => {
		throw new Error(
			res.ok
				? "Invalid response from server"
				: fallbackMessage || "Request failed",
		);
	});
}

// Auth
export async function login(email, password) {
	const res = await fetch(`${API_BASE}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Login failed");
	return data;
}

export async function register(body) {
	const res = await fetch(`${API_BASE}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Registration failed");
	return data;
}

export async function getMe() {
	const res = await fetch(`${API_BASE}/auth/me`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Not authenticated");
	return data;
}

export async function loginWithGoogle(credentialOrIdToken) {
	const res = await fetch(`${API_BASE}/auth/google`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			credential: credentialOrIdToken,
			idToken: credentialOrIdToken,
		}),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Google sign-in failed");
	return data;
}

// Dashboard
export async function getUserDashboard() {
	const res = await fetch(`${API_BASE}/dashboard/user`, {
		headers: getAuthHeaders(),
	});
	const data = await parseJsonOrThrow(res, "Failed to load dashboard");
	if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
	return data.data !== undefined ? data.data : data;
}

export async function getAdminDashboard() {
	const res = await fetch(`${API_BASE}/dashboard/admin`, {
		headers: getAuthHeaders(),
	});
	const data = await parseJsonOrThrow(res, "Failed to load admin dashboard");
	if (!res.ok)
		throw new Error(data.message || "Failed to load admin dashboard");
	return data.data !== undefined ? data.data : data;
}

// Usage
export async function getUsage() {
	const res = await fetch(`${API_BASE}/usage`, { headers: getAuthHeaders() });
	// If we can't parse JSON or get a non-ok response, return a safe fallback
	// so scans aren't blocked by usage-check failures — the scan endpoint itself
	// enforces the limit and returns the proper "limit reached" message.
	let data;
	try {
		data = await res.json();
	} catch (_) {
		return { scanCount: 0, scanLimit: 5, canScan: true, credits: 0, plan: null };
	}
	if (!res.ok) {
		// Server said no — check for scan limit message specifically
		const msg = data?.message || "";
		if (/scan.limit|limit.reached|daily.scan.limit/i.test(msg)) {
			return { scanCount: 0, scanLimit: 5, canScan: false, credits: 0, plan: null };
		}
		// Other errors (auth, server crash, etc.) — don't block scans
		return { scanCount: 0, scanLimit: 5, canScan: true, credits: 0, plan: null };
	}
	return data.data || {
		scanCount: 0,
		scanLimit: 5,
		canScan: true,
		credits: 0,
		plan: null,
	};
}

export async function getScanHistory(limit = 100, page = 1) {
	const q = new URLSearchParams();
	if (limit) q.set("limit", String(limit));
	if (page) q.set("page", String(page));
	const res = await fetch(`${API_BASE}/usage/scans?${q}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load scan history");
	return data.data;
}

export async function getScanDetail(id) {
	const res = await fetch(`${API_BASE}/usage/scans/${id}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load scan detail");
	return data.data;
}

export async function recordScan(meta = {}) {
	const res = await fetch(`${API_BASE}/usage/record-scan`, {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify(meta && typeof meta === "object" ? meta : {}),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to record scan");
	return data.data;
}

export async function addCredits(amount, credits) {
	const res = await fetch(`${API_BASE}/usage/add-credits`, {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify({ amount, credits }),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to add credits");
	return data.data;
}

// Plans
export async function getPlans() {
	const res = await fetch(`${API_BASE}/plans`);
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load plans");
	return data.data.plans;
}

export async function selectPlanMock({ planId, planSlug }) {
	const res = await fetch(`${API_BASE}/plans/select`, {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify({ planId, planSlug }),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Could not update plan");
	return data.data;
}

export async function refreshSessionUser() {
	const data = await getMe();
	const user = data.data?.user;
	if (user) localStorage.setItem("fraudlens_user", JSON.stringify(user));
	return user;
}

// Admin: Users
export async function getAdminUsers(params = {}) {
	const q = new URLSearchParams(params).toString();
	const res = await fetch(`${API_BASE}/admin/users${q ? `?${q}` : ""}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load users");
	return data;
}

export async function getAdminUser(id) {
	const res = await fetch(`${API_BASE}/admin/users/${id}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load user");
	return data;
}

export async function updateAdminUser(id, payload) {
	const res = await fetch(`${API_BASE}/admin/users/${id}`, {
		method: "PUT",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Update failed");
	return data;
}

export async function deactivateUser(id) {
	const res = await fetch(`${API_BASE}/admin/users/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Deactivate failed");
	return data;
}

// Admin: Plans
export async function getAdminPlans() {
	const res = await fetch(`${API_BASE}/admin/plans`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load plans");
	return data.data.plans;
}

export async function createAdminPlan(payload) {
	const res = await fetch(`${API_BASE}/admin/plans`, {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to create plan");
	return data;
}

export async function updateAdminPlan(id, payload) {
	const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
		method: "PUT",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to update plan");
	return data;
}

export async function deleteAdminPlan(id) {
	const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to delete plan");
	return data;
}

// Admin: Payments
export async function getAdminPayments(params = {}) {
	const q = new URLSearchParams(params).toString();
	const res = await fetch(`${API_BASE}/admin/payments${q ? `?${q}` : ""}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load payments");
	return data.data;
}

export async function getAdminPaymentsByUser(userId) {
	const res = await fetch(`${API_BASE}/admin/payments/user/${userId}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok)
		throw new Error(data.message || "Failed to load user payments");
	return data.data;
}

// Admin: Contacts
export async function getAdminContacts(params = {}) {
	const q = new URLSearchParams(params).toString();
	const res = await fetch(`${API_BASE}/admin/contacts${q ? `?${q}` : ""}`, {
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to load contacts");
	return data.data;
}

export async function updateAdminContact(id, payload) {
	const res = await fetch(`${API_BASE}/admin/contacts/${id}`, {
		method: "PUT",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Failed to update contact");
	return data.data;
}

// Public: Contact form
export async function submitContact(formData) {
	const res = await fetch(`${API_BASE}/contact`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
	});
	const data = await res.json();
	if (!res.ok)
		throw new Error(data.message || "Failed to submit contact form");
	return data;
}

// Scan
export async function scanEmail(text) {
	const res = await fetch(`${API_BASE}/scan/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text: text || "" }),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Scan failed");
	return data;
}

export async function scanSms(text) {
	const res = await fetch(`${API_BASE}/scan/sms`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text: text || "" }),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Scan failed");
	return data;
}

export async function scanUpi(payload) {
	if (typeof payload === "string") {
		const res = await fetch(`${API_BASE}/scan/upi`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: payload }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Scan failed");
		return data;
	}
	const res = await fetch(`${API_BASE}/scan/upi`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Scan failed");
	return data;
}

export async function getGeminiExplanation({
	scanType,
	contentPreview,
	verdict,
	score,
	reasons,
}) {
	const res = await fetch(`${API_BASE}/gemini/explain`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			scanType: scanType || "email",
			contentPreview: contentPreview || "",
			verdict: verdict || "Legitimate",
			score: score ?? 50,
			reasons: Array.isArray(reasons) ? reasons : [],
		}),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Explanation failed");
	if (!data.success || !data.explanation)
		throw new Error(data.message || "No explanation returned");
	return data.explanation;
}

export { getToken, getAuthHeaders, API_BASE };
