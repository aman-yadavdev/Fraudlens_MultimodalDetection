/**
 * ML Backend API client for fraud detection (Email, SMS, UPI).
 * Base URL: REACT_APP_ML_API_URL or http://localhost:5000
 */

const ML_API_BASE = process.env.REACT_APP_ML_API_URL || "http://localhost:5000";

async function handleResponse(res) {
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(data.error || data.message || `Request failed (${res.status})`);
	}
	return data;
}

/**
 * POST /predict/email
 * body: { text } or FormData with 'file' (image)
 */
export async function predictEmail({ text, file }) {
	if (file) {
		const form = new FormData();
		form.append("file", file);
		const res = await fetch(`${ML_API_BASE}/predict/email`, {
			method: "POST",
			body: form,
		});
		return handleResponse(res);
	}
	const res = await fetch(`${ML_API_BASE}/predict/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text: text || "" }),
	});
	return handleResponse(res);
}

/**
 * POST /predict/sms
 * body: { text } or FormData with 'file' (image)
 */
export async function predictSms({ text, file }) {
	if (file) {
		const form = new FormData();
		form.append("file", file);
		const res = await fetch(`${ML_API_BASE}/predict/sms`, {
			method: "POST",
			body: form,
		});
		return handleResponse(res);
	}
	const res = await fetch(`${ML_API_BASE}/predict/sms`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text: text || "" }),
	});
	return handleResponse(res);
}

/**
 * POST /predict/upi
 * body: { amount, sender_upi, receiver_upi, ... } or { text } (OCR text from frontend)
 * or FormData with 'file' (screenshot) - backend OCR fallback
 */
export async function predictUpi({ payload, file, text }) {
	if (file) {
		const form = new FormData();
		form.append("file", file);
		const res = await fetch(`${ML_API_BASE}/predict/upi`, {
			method: "POST",
			body: form,
		});
		return handleResponse(res);
	}
	const body = payload || (text != null ? { text: String(text) } : {});
	const res = await fetch(`${ML_API_BASE}/predict/upi`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return handleResponse(res);
}

/**
 * GET /health
 */
export async function getHealth() {
	const res = await fetch(`${ML_API_BASE}/health`);
	return handleResponse(res);
}

export { ML_API_BASE };
