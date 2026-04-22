import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Upload,
	MessageSquare,
	Mail,
	Shield,
	Loader2,
	CheckCircle,
} from "lucide-react";
import Modal from "../Modal";
import {
	predictEmail,
	predictSms,
	predictUpi,
	getHealth,
} from "../../api/mlApi";
import {
	getGeminiExplanation,
	getToken,
	recordScan,
} from "../../api/client";
import { extractTextFromImage } from "../../utils/ocr";

const ML_NOT_RUNNING_MSG =
	"ML API is not running. Start ml-api (e.g. `python app.py` in ml-api, port 5001).";

/**
 * Dashboard quick-action scan: UPI / SMS / Email in a modal; on success navigates to /result.
 */
export default function DashboardQuickScanModal({ mode, isOpen, onClose }) {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);

	const [isDragging, setIsDragging] = useState(false);
	const [uploadedFile, setUploadedFile] = useState(null);
	const [smsText, setSmsText] = useState("");
	const [emailText, setEmailText] = useState("");
	const [smsFile, setSmsFile] = useState(null);
	const [emailFile, setEmailFile] = useState(null);
	const [smsMode, setSmsMode] = useState("text");
	const [emailMode, setEmailMode] = useState("text");
	const [smsLoading, setSmsLoading] = useState(false);
	const [smsError, setSmsError] = useState(null);
	const [emailLoading, setEmailLoading] = useState(false);
	const [emailError, setEmailError] = useState(null);
	const [upiLoading, setUpiLoading] = useState(false);
	const [upiError, setUpiError] = useState(null);

	useEffect(() => {
		if (!isOpen) return;
		setIsDragging(false);
		setUploadedFile(null);
		setSmsText("");
		setEmailText("");
		setSmsFile(null);
		setEmailFile(null);
		setSmsMode("text");
		setEmailMode("text");
		setSmsLoading(false);
		setSmsError(null);
		setEmailLoading(false);
		setEmailError(null);
		setUpiLoading(false);
		setUpiError(null);
	}, [isOpen, mode]);

	const title =
		mode === "upi"
			? "UPI screenshot scan"
			: mode === "sms"
				? "Verify SMS"
				: mode === "email"
					? "Scan email for phishing"
					: "";

	const handleUpi = async () => {
		if (!uploadedFile) return;
		setUpiError(null);
		setUpiLoading(true);
		try {
			await getHealth();
		} catch (err) {
			setUpiError(ML_NOT_RUNNING_MSG);
			setUpiLoading(false);
			return;
		}
		try {
			const { text: ocrText } = await extractTextFromImage(uploadedFile);
			if (!ocrText?.trim()) {
				setUpiError(
					"Could not extract text from image. Try a clearer screenshot.",
				);
				return;
			}
			const mlResult = await predictUpi({ text: ocrText });
			const payload = {
				...mlResult,
				extracted_text: mlResult.extracted_text ?? ocrText,
			};
			let explanation = null;
			try {
				if (payload.verdict !== "Not a UPI screenshot") {
					explanation = await getGeminiExplanation({
						scanType: "upi",
						contentPreview: payload.extracted_text || ocrText,
						verdict: payload.verdict,
						score: payload.score,
						reasons: payload.reasons || [],
					});
				}
			} catch (_) {}
			if (getToken()) {
				await recordScan({
					scanType: "upi",
					verdict: payload.verdict,
					score: payload.score,
					contentPreview: (
						payload.extracted_text ||
						ocrText ||
						""
					).slice(0, 500),
				});
			}
			const screenshotDataUrl = uploadedFile
				? URL.createObjectURL(uploadedFile)
				: null;
			onClose();
			navigate("/result", {
				state: {
					scanType: "upi",
					verdict: payload.verdict,
					score: payload.score,
					reasons: payload.reasons,
					extracted_text: payload.extracted_text,
					explanation: explanation || payload.explanation,
					screenshotDataUrl,
					parsed_fields: payload.parsed_fields,
				},
			});
		} catch (err) {
			setUpiError(err.message || "Analysis failed");
		} finally {
			setUpiLoading(false);
		}
	};

	const handleSms = async () => {
		const hasText = smsText.trim().length > 0;
		const hasFile = smsFile && smsFile.type?.startsWith("image/");
		if (!hasText && !hasFile) return;
		setSmsError(null);
		setSmsLoading(true);
		try {
			await getHealth();
		} catch (err) {
			setSmsError(ML_NOT_RUNNING_MSG);
			setSmsLoading(false);
			return;
		}
		try {
			let textToSend = smsText.trim();
			if (hasFile) {
				const { text: ocrText } = await extractTextFromImage(smsFile);
				if (!ocrText?.trim()) {
					setSmsError(
						"Could not extract text from image. Try a clearer screenshot.",
					);
					return;
				}
				textToSend = ocrText;
			}
			const mlResult = await predictSms({ text: textToSend });
			const payload = {
				...mlResult,
				extracted_text: mlResult.extracted_text ?? textToSend,
			};
			let explanation = null;
			try {
				explanation = await getGeminiExplanation({
					scanType: "sms",
					contentPreview: payload.extracted_text || textToSend,
					verdict: payload.verdict,
					score: payload.score,
					reasons: payload.reasons || [],
				});
			} catch (_) {}
			if (getToken()) {
				await recordScan({
					scanType: "sms",
					verdict: payload.verdict,
					score: payload.score,
					contentPreview: (
						payload.extracted_text ||
						textToSend ||
						""
					).slice(0, 500),
				});
			}
			const screenshotDataUrl =
				hasFile && smsFile ? URL.createObjectURL(smsFile) : null;
			onClose();
			navigate("/result", {
				state: {
					scanType: "sms",
					verdict: payload.verdict,
					score: payload.score,
					reasons: payload.reasons,
					extracted_text: payload.extracted_text,
					explanation: explanation || payload.explanation,
					screenshotDataUrl,
				},
			});
		} catch (err) {
			setSmsError(err.message || "Analysis failed");
		} finally {
			setSmsLoading(false);
		}
	};

	const handleEmail = async () => {
		const hasText = emailText.trim().length > 0;
		const hasFile = emailFile && emailFile.type?.startsWith("image/");
		if (!hasText && !hasFile) return;
		setEmailError(null);
		setEmailLoading(true);
		try {
			await getHealth();
		} catch (err) {
			setEmailError(ML_NOT_RUNNING_MSG);
			setEmailLoading(false);
			return;
		}
		try {
			let textToSend = emailText.trim();
			if (hasFile) {
				const { text: ocrText } = await extractTextFromImage(emailFile);
				if (!ocrText?.trim()) {
					setEmailError(
						"Could not extract text from image. Try a clearer screenshot.",
					);
					return;
				}
				textToSend = ocrText;
			}
			const mlResult = await predictEmail({ text: textToSend });
			const payload = {
				...mlResult,
				extracted_text: mlResult.extracted_text ?? textToSend,
			};
			let explanation = null;
			try {
				explanation = await getGeminiExplanation({
					scanType: "email",
					contentPreview: payload.extracted_text || textToSend,
					verdict: payload.verdict,
					score: payload.score,
					reasons: payload.reasons || [],
				});
			} catch (_) {}
			if (getToken()) {
				await recordScan({
					scanType: "email",
					verdict: payload.verdict,
					score: payload.score,
					contentPreview: (
						payload.extracted_text ||
						textToSend ||
						""
					).slice(0, 500),
				});
			}
			const screenshotDataUrl =
				hasFile && emailFile ? URL.createObjectURL(emailFile) : null;
			onClose();
			navigate("/result", {
				state: {
					scanType: "email",
					verdict: payload.verdict,
					score: payload.score,
					reasons: payload.reasons,
					extracted_text: payload.extracted_text,
					explanation: explanation || payload.explanation,
					screenshotDataUrl,
				},
			});
		} catch (err) {
			setEmailError(err.message || "Analysis failed");
		} finally {
			setEmailLoading(false);
		}
	};

	if (!mode) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} wide>
			{mode === "upi" && (
				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						Upload a UPI payment screenshot. We’ll OCR the image and
						run the fraud check.
					</p>
					<div
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={(e) => {
							e.preventDefault();
							setIsDragging(false);
						}}
						onDrop={(e) => {
							e.preventDefault();
							setIsDragging(false);
							const f = e.dataTransfer.files?.[0];
							if (f) setUploadedFile(f);
						}}
						onClick={() => fileInputRef.current?.click()}
						className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
							isDragging
								? "border-primary-500 bg-primary-50"
								: "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
						}`}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={(e) =>
								setUploadedFile(e.target.files?.[0] || null)
							}
							className="hidden"
						/>
						<Upload
							className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-primary-600" : "text-gray-400"}`}
						/>
						{uploadedFile ? (
							<p className="text-green-700 font-medium flex items-center justify-center gap-2">
								<CheckCircle className="w-5 h-5" />{" "}
								{uploadedFile.name}
							</p>
						) : (
							<p className="text-gray-700 font-medium">
								Drop an image here or click to browse
							</p>
						)}
						<p className="text-xs text-gray-500 mt-2">
							JPG, PNG, WebP
						</p>
					</div>
					{upiError && (
						<p className="text-sm text-red-600">{upiError}</p>
					)}
					<button
						type="button"
						onClick={handleUpi}
						disabled={!uploadedFile || upiLoading}
						className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{upiLoading ? (
							<>
								<Loader2 className="w-5 h-5 inline mr-2 animate-spin" />{" "}
								Analyzing…
							</>
						) : (
							<>
								<Shield className="w-5 h-5 inline mr-2" />{" "}
								Detect UPI fraud
							</>
						)}
					</button>
				</div>
			)}

			{mode === "sms" && (
				<div className="space-y-4">
					<div className="flex gap-2 border-b border-gray-200 pb-2">
						<button
							type="button"
							onClick={() => {
								setSmsMode("text");
								setSmsFile(null);
								setSmsError(null);
							}}
							className={`px-4 py-2 rounded-lg text-sm font-medium ${smsMode === "text" ? "bg-primary-100 text-primary-700" : "text-gray-600 hover:bg-gray-100"}`}
						>
							Enter text
						</button>
						<button
							type="button"
							onClick={() => {
								setSmsMode("screenshot");
								setSmsText("");
								setSmsError(null);
							}}
							className={`px-4 py-2 rounded-lg text-sm font-medium ${smsMode === "screenshot" ? "bg-primary-100 text-primary-700" : "text-gray-600 hover:bg-gray-100"}`}
						>
							Upload screenshot
						</button>
					</div>
					{smsMode === "text" ? (
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Paste SMS content
							</label>
							<textarea
								value={smsText}
								onChange={(e) => setSmsText(e.target.value)}
								placeholder="Paste your SMS message here…"
								className="w-full h-36 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none text-sm"
							/>
						</div>
					) : (
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Screenshot (JPG, PNG, WebP)
							</label>
							<input
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								onChange={(e) =>
									setSmsFile(e.target.files?.[0] || null)
								}
								className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
							/>
							{smsFile && (
								<p className="text-xs text-green-600 mt-2">
									✓ {smsFile.name}
								</p>
							)}
						</div>
					)}
					{smsError && (
						<p className="text-sm text-red-600">{smsError}</p>
					)}
					<button
						type="button"
						onClick={handleSms}
						disabled={
							(smsMode === "text" ? !smsText.trim() : !smsFile) ||
							smsLoading
						}
						className="w-full btn-primary py-3 disabled:opacity-50"
					>
						{smsLoading ? (
							<>
								<Loader2 className="w-5 h-5 inline mr-2 animate-spin" />{" "}
								Analyzing…
							</>
						) : (
							<>
								<MessageSquare className="w-5 h-5 inline mr-2" />{" "}
								Verify SMS
							</>
						)}
					</button>
				</div>
			)}

			{mode === "email" && (
				<div className="space-y-4">
					<div className="flex gap-2 border-b border-gray-200 pb-2">
						<button
							type="button"
							onClick={() => {
								setEmailMode("text");
								setEmailFile(null);
								setEmailError(null);
							}}
							className={`px-4 py-2 rounded-lg text-sm font-medium ${emailMode === "text" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
						>
							Enter text
						</button>
						<button
							type="button"
							onClick={() => {
								setEmailMode("screenshot");
								setEmailText("");
								setEmailError(null);
							}}
							className={`px-4 py-2 rounded-lg text-sm font-medium ${emailMode === "screenshot" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
						>
							Upload screenshot
						</button>
					</div>
					{emailMode === "text" ? (
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Paste email content
							</label>
							<textarea
								value={emailText}
								onChange={(e) => setEmailText(e.target.value)}
								placeholder="Paste email body (and headers if you like)…"
								className="w-full h-36 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none text-sm"
							/>
						</div>
					) : (
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Email screenshot (JPG, PNG, WebP)
							</label>
							<input
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								onChange={(e) =>
									setEmailFile(e.target.files?.[0] || null)
								}
								className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700"
							/>
							{emailFile && (
								<p className="text-xs text-green-600 mt-2">
									✓ {emailFile.name}
								</p>
							)}
						</div>
					)}
					{emailError && (
						<p className="text-sm text-red-600">{emailError}</p>
					)}
					<button
						type="button"
						onClick={handleEmail}
						disabled={
							(emailMode === "text"
								? !emailText.trim()
								: !emailFile) || emailLoading
						}
						className="w-full btn-primary py-3 disabled:opacity-50"
					>
						{emailLoading ? (
							<>
								<Loader2 className="w-5 h-5 inline mr-2 animate-spin" />{" "}
								Analyzing…
							</>
						) : (
							<>
								<Mail className="w-5 h-5 inline mr-2" /> Scan
								email
							</>
						)}
					</button>
				</div>
			)}
		</Modal>
	);
}
