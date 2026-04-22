/**
 * Browser-side OCR using Tesseract.js. No server-side Tesseract required.
 * Extracts text from image File (screenshot) for Email, SMS, and UPI flows.
 */

import Tesseract from "tesseract.js";

/**
 * Extract text from an image file (e.g. screenshot) using Tesseract.js in the browser.
 * @param {File} file - Image file (jpg, png, webp)
 * @returns {Promise<{ text: string, confidence?: number }>}
 */
export async function extractTextFromImage(file) {
	if (!file || !file.type?.startsWith("image/")) {
		throw new Error("Please provide an image file (jpg, png, webp).");
	}
	// Don't pass logger - Tesseract.js v5 expects a specific logger API; omitting avoids "logger is not a function"
	const result = await Tesseract.recognize(file, "eng");
	const text = (result.data?.text || "").replace(/\s+/g, " ").trim();
	const confidence = result.data?.confidence;
	return { text, confidence };
}
