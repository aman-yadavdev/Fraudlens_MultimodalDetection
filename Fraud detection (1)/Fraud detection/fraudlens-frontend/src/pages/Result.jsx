import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
	Shield,
	ArrowLeft,
	CheckCircle,
	XCircle,
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	FileText,
	Image as ImageIcon,
	ListChecks,
	Sparkles,
	Lightbulb,
	Clock,
	Info,
	CreditCard,
	Lock,
} from "lucide-react";
import { getToken, recordScan } from "../api/client";

/** OCR often reads ₹ as "3". Fix leading "3" when followed by digit+comma (e.g. 31,400.00 → ₹1,400.00). */
function fixRupeeInExtractedText(text) {
	if (!text || typeof text !== "string") return text;
	return text.replace(/^3(\d,)/, "₹$1");
}

/** Format date for report metadata */
function formatReportDate() {
	return new Date().toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/** Enterprise recommendations by scan type and verdict */
function getRecommendations(scanType, verdict, score) {
	const isRisky = ["Phishing", "Scam", "Fraud", "Suspicious"].includes(verdict);
	const recommendations = [];

	if (scanType === "email") {
		if (isRisky) {
			recommendations.push(
				{ priority: "critical", title: "Do not click any links", description: "Links may lead to phishing sites or malware. Open URLs only by typing the official domain in your browser." },
				{ priority: "critical", title: "Do not enter credentials", description: "Legitimate organisations never ask for passwords or OTP via email. Do not reply with or submit any login details." },
				{ priority: "high", title: "Verify sender independently", description: "Contact the organisation using a known phone number or website from your records, not from this email." },
				{ priority: "high", title: "Check email headers", description: "Inspect the full email headers (Reply-To, Return-Path) to spot spoofed or mismatched domains." },
				{ priority: "medium", title: "Report to your IT / security team", description: "If this is a work email, forward it to your IT or security team for investigation and blocking." }
			);
		} else {
			recommendations.push(
				{ priority: "low", title: "Continue to verify for high-value actions", description: "For sensitive actions (payments, account changes), confirm via official app or known contact." },
				{ priority: "low", title: "Keep your email secure", description: "Use strong passwords and enable 2FA on your email account." }
			);
		}
	}

	if (scanType === "sms") {
		if (isRisky) {
			recommendations.push(
				{ priority: "critical", title: "Do not share OTP or PIN", description: "No legitimate service will ask for OTP or PIN via SMS. Never share these with anyone." },
				{ priority: "critical", title: "Do not call toll numbers in the message", description: "Toll numbers may be premium-rate or used for social engineering. Call only numbers from official sources." },
				{ priority: "high", title: "Do not reply or click links", description: "Replying or clicking links can confirm your number is active or lead to malware. Block the sender." },
				{ priority: "high", title: "Report to your operator", description: "Forward the message to your telecom operator's spam number (e.g. 1909) and block the sender." },
				{ priority: "medium", title: "Verify via official app or website", description: "If the message claims to be from your bank or a service, log in via the official app or type the URL yourself." }
			);
		} else {
			recommendations.push(
				{ priority: "low", title: "Stay cautious with links", description: "Even for seemingly legitimate SMS, prefer opening the official app or website directly." },
				{ priority: "low", title: "Block and report if unsure", description: "If you receive similar messages again, block the sender and report to your operator." }
			);
		}
	}

	if (scanType === "upi") {
		if (verdict === "Not a UPI screenshot") {
			recommendations.push(
				{
					priority: "medium",
					title: "Use the right scan type",
					description:
						"This image does not look like a UPI payment screen. For SMS or email content, open those tabs on the home page. For payments, upload a screenshot from Google Pay, PhonePe, Paytm, or your bank app showing the transaction.",
				},
				{
					priority: "low",
					title: "Retake if needed",
					description: "Ensure the screenshot shows UPI IDs (name@bank) or clear payment-app wording so text can be read reliably.",
				}
			);
			return recommendations;
		}
		if (isRisky) {
			recommendations.push(
				{ priority: "critical", title: "Do not transfer money", description: "Do not make any payment or transfer based on this screenshot or request until verified through a trusted channel." },
				{ priority: "critical", title: "Verify recipient offline", description: "Confirm the UPI ID and amount with the recipient in person or via a known phone number, not from this message." },
				{ priority: "high", title: "Check UPI ID and PSP", description: "Legitimate UPI IDs use known banks/PSPs (@paytm, @ybl, @okaxis, etc.). Unknown handles like @slc or @xyz are red flags." },
				{ priority: "high", title: "If you have already paid", description: "Contact your bank and NPCI (1860-266-2660) immediately. Report the transaction and request a dispute if applicable." },
				{ priority: "medium", title: "Report to your bank", description: "Share this assessment with your bank's fraud team and block the recipient UPI ID if possible." }
			);
		} else {
			recommendations.push(
				{ priority: "low", title: "Keep proof of transaction", description: "Retain the official transaction receipt from your UPI app for your records." },
				{ priority: "low", title: "Verify for large amounts", description: "For high-value payments, confirm the recipient and amount through a second channel." }
			);
		}
	}

	return recommendations;
}

/** Risk band for enterprise display */
function getRiskBand(score) {
	if (score >= 70) return { label: "Critical", color: "red", bg: "bg-red-50", border: "border-red-200", text: "text-red-800", bar: "bg-red-500" };
	if (score >= 40) return { label: "High", color: "amber", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", bar: "bg-amber-500" };
	if (score >= 20) return { label: "Medium", color: "yellow", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", bar: "bg-yellow-500" };
	return { label: "Low", color: "emerald", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", bar: "bg-emerald-500" };
}

const RESULT_STORAGE_KEY = "fraudlens_result_after_login";

export default function Result() {
	const location = useLocation();
	const navigate = useNavigate();
	let state = location.state;
	const [showExtractedText, setShowExtractedText] = useState(false);

	// Restore result state after login (saved when guest clicked "Log in to see full report")
	React.useEffect(() => {
		if (!state && getToken()) {
			try {
				const saved = sessionStorage.getItem(RESULT_STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					sessionStorage.removeItem(RESULT_STORAGE_KEY);
					navigate("/result", { state: parsed, replace: true });
				}
			} catch (_) {}
		}
	}, [navigate, state]);

	if (!state) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center px-4">
					<p className="text-slate-600 mb-4">No scan result found.</p>
					<button
						onClick={() => navigate("/")}
						className="text-primary-600 font-medium hover:underline"
					>
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	const {
		scanType = "email",
		verdict,
		score,
		reasons = [],
		extracted_text,
		explanation,
		screenshotDataUrl,
		parsed_fields,
	} = state;

	const isNotUpiScreenshot = verdict === "Not a UPI screenshot";
	const isSuspicious = verdict === "Suspicious";
	const isLegit =
		!isNotUpiScreenshot &&
		!isSuspicious &&
		(verdict === "Legitimate" ||
			verdict === "Ham" ||
			(verdict !== "Phishing" && verdict !== "Scam" && verdict !== "Fraud"));
	const typeLabel = scanType === "email" ? "Email" : scanType === "sms" ? "SMS" : "UPI";

	const riskBand = getRiskBand(score);
	const recommendations = getRecommendations(scanType, verdict, score);
	const reportDate = formatReportDate();
	const isLoggedIn = !!getToken();
	const returnUrl = "/result";

	return (
		<div className="min-h-screen bg-slate-100 py-6 px-4 sm:py-8">
			<div className="max-w-4xl mx-auto">
				{/* Top bar */}
				<div className="flex items-center justify-between mb-6">
					<button
						onClick={() => navigate("/")}
						className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to scan
					</button>
					<div className="flex items-center gap-2 text-slate-500 text-sm">
						<Clock className="w-4 h-4" />
						{reportDate}
					</div>
				</div>

				{/* Report container */}
				<div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
					{/* Report header */}
					<div className="px-6 sm:px-8 py-5 border-b border-slate-200 bg-slate-50/50">
						<div className="flex items-center gap-3 mb-1">
							<Shield className="w-8 h-8 text-primary-600" />
							<div>
								<h1 className="text-lg font-bold text-slate-900">Fraud Assessment Report</h1>
								<p className="text-sm text-slate-500">
									{typeLabel} scan · Generated {reportDate}
								</p>
							</div>
						</div>
					</div>

					{/* Executive summary / Verdict - always visible (basic info) */}
					<div
						className={`px-6 sm:px-8 py-6 border-b-2 ${riskBand.bg} ${riskBand.border}`}
					>
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
							<div className="flex items-start gap-4">
																<div
									className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
										isNotUpiScreenshot
											? "bg-slate-100 text-slate-700"
											: isLegit
											? "bg-emerald-100 text-emerald-700"
											: isSuspicious
											? "bg-amber-100 text-amber-700"
											: "bg-red-100 text-red-700"
									}`}
								>
									{isNotUpiScreenshot ? (
										<Info className="w-9 h-9" />
									) : isLegit ? (
										<CheckCircle className="w-9 h-9" />
									) : isSuspicious ? (
										<AlertTriangle className="w-9 h-9" />
									) : (
										<XCircle className="w-9 h-9" />
									)}
								</div>
								<div>
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
										Executive summary
									</p>
									<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
										{verdict}
									</h2>
									<p className="text-slate-600 mt-1">
										{isNotUpiScreenshot ? (
											<>
												This image is{" "}
												<span className="font-semibold">not treated as a UPI payment screen</span>. No fraud
												model was applied; choose Email or SMS scan, or upload a payment-app screenshot.
											</>
										) : (
											<>
												This {typeLabel.toLowerCase()} content has been classified as{" "}
												<span className="font-semibold">{verdict}</span> with a fraud risk score of{" "}
												<span className="font-semibold">{score}/100</span> ({riskBand.label} risk).
											</>
										)}
									</p>
								</div>
							</div>
							<div className="flex flex-col gap-3 min-w-[200px]">
								<div>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-slate-500">Risk score</span>
										<span className={`font-semibold ${riskBand.text}`}>{score}/100</span>
									</div>
									<div className="h-3 bg-slate-200 rounded-full overflow-hidden">
										<div
											className={`h-full rounded-full transition-all ${riskBand.bar}`}
											style={{ width: `${Math.min(100, score)}%` }}
										/>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${riskBand.bg} ${riskBand.text} border ${riskBand.border}`}>
										{riskBand.label} risk
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Full report content: blurred when not logged in, with overlay CTA */}
					<div className={`relative ${!isLoggedIn ? "select-none" : ""}`}>
						{!isLoggedIn && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] rounded-b-2xl min-h-[320px]">
								<div className="mx-4 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
									<div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
										<Lock className="w-7 h-7" />
									</div>
									<h3 className="text-lg font-bold text-slate-900 mb-2">Log in to see full report</h3>
									<p className="text-sm text-slate-600 mb-5">
										View recommendations, AI explanation, key findings, and more. Your scan does not count toward your limit until you sign in.
									</p>
									<button
										type="button"
										onClick={() => {
											sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(state));
											navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
										}}
										className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
									>
										Log in
									</button>
									<p className="text-xs text-slate-500 mt-4">
										Don&apos;t have an account?{" "}
										<Link to="/signup" className="text-primary-600 hover:underline font-medium">
											Sign up
										</Link>
									</p>
								</div>
							</div>
						)}
						<div className={!isLoggedIn ? "blur-md pointer-events-none" : ""}>

					{/* Recommendations - enterprise focus */}
					{recommendations.length > 0 && (
						<section className="px-6 sm:px-8 py-6 border-b border-slate-200 bg-amber-50/30">
							<div className="flex items-center gap-2 mb-4">
								<Lightbulb className="w-5 h-5 text-amber-600" />
								<h2 className="text-base font-bold text-slate-800">Recommendations</h2>
							</div>
							<p className="text-sm text-slate-600 mb-4">
								Based on this assessment, follow these steps to protect yourself and your organisation:
							</p>
							<ul className="space-y-3">
								{recommendations.map((rec, i) => (
									<li key={i} className="flex gap-3">
										<span
											className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
												rec.priority === "critical"
													? "bg-red-100 text-red-700"
													: rec.priority === "high"
													? "bg-amber-100 text-amber-700"
													: "bg-slate-200 text-slate-600"
											}`}
										>
											{i + 1}
										</span>
										<div>
											<p className="font-semibold text-slate-800">{rec.title}</p>
											<p className="text-sm text-slate-600 mt-0.5">{rec.description}</p>
										</div>
									</li>
								))}
							</ul>
						</section>
					)}

					{/* AI analysis */}
					{explanation && (
						<section className="px-6 sm:px-8 py-6 border-b border-slate-200">
							<div className="flex items-center gap-2 mb-3">
								<Sparkles className="w-5 h-5 text-slate-600" />
								<h2 className="text-base font-bold text-slate-800">
									{isLegit ? "Why this looks legitimate" : "Why this was flagged"}
								</h2>
							</div>
							<p className="text-slate-700 leading-relaxed whitespace-pre-line">
								{explanation}
							</p>
						</section>
					)}

					{/* Key findings */}
					{reasons.length > 0 && (
						<section className="px-6 sm:px-8 py-6 border-b border-slate-200">
							<div className="flex items-center gap-2 mb-3">
								<ListChecks className="w-5 h-5 text-slate-600" />
								<h2 className="text-base font-bold text-slate-800">Key findings</h2>
							</div>
							<ul className="space-y-2">
								{reasons.map((r, i) => (
									<li key={i} className="flex items-start gap-3 text-slate-700">
										<span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
											{i + 1}
										</span>
										<span>{r}</span>
									</li>
								))}
							</ul>
						</section>
					)}

					{/* Screenshot / Evidence */}
					{screenshotDataUrl && (
						<section className="px-6 sm:px-8 py-6 border-b border-slate-200">
							<div className="flex items-center gap-2 mb-3">
								<ImageIcon className="w-5 h-5 text-slate-600" />
								<h2 className="text-base font-bold text-slate-800">Attached evidence</h2>
							</div>
							<p className="text-sm text-slate-500 mb-3">Screenshot submitted for analysis.</p>
							<div className="rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden">
								<img
									src={screenshotDataUrl}
									alt="Scanned content"
									className="w-full max-h-[28rem] object-contain"
								/>
							</div>
						</section>
					)}

					{/* Transaction details (UPI) */}
					{parsed_fields && Object.keys(parsed_fields).length > 0 && (
						<section className="px-6 sm:px-8 py-6 border-b border-slate-200">
							<div className="flex items-center gap-2 mb-3">
								<CreditCard className="w-5 h-5 text-slate-600" />
								<h2 className="text-base font-bold text-slate-800">Transaction details</h2>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{Object.entries(parsed_fields).map(
									([key, value]) =>
										value != null &&
										value !== "" && (
											<div
												key={key}
												className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-200"
											>
												<span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
													{key.replace(/_/g, " ")}
												</span>
												<span className="text-sm font-medium text-slate-800 mt-1">
													{String(value)}
												</span>
											</div>
										)
								)}
							</div>
						</section>
					)}

					{/* Extracted text */}
					{extracted_text && (
						<section className="px-6 sm:px-8 py-6 border-b border-slate-200">
							<button
								type="button"
								onClick={() => setShowExtractedText((v) => !v)}
								className="flex items-center justify-between w-full gap-2 text-left"
							>
								<div className="flex items-center gap-2">
									<FileText className="w-5 h-5 text-slate-600" />
									<h2 className="text-base font-bold text-slate-800">Extracted text</h2>
								</div>
								{showExtractedText ? (
									<ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
								) : (
									<ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
								)}
							</button>
							<p className="text-sm text-slate-500 mt-1 mb-2">Raw text from the submitted content (e.g. OCR).</p>
							{showExtractedText && (
								<pre className="p-4 text-sm text-slate-600 bg-slate-50 rounded-xl border border-slate-200 overflow-auto max-h-64 whitespace-pre-wrap font-sans">
									{fixRupeeInExtractedText(extracted_text)}
								</pre>
							)}
						</section>
					)}

					{/* Disclaimer & metadata footer */}
					<div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-200">
						<div className="flex items-start gap-2 mb-3">
							<Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
							<div className="text-xs text-slate-500 leading-relaxed">
								<p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
								<p>
									This report is generated by an automated AI-based assessment and is for informational purposes only. It does not constitute legal or professional advice. Always verify high-value or sensitive transactions through official channels. FraudLens is not responsible for decisions taken based on this report.
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-200">
							<span>Scan type: {typeLabel}</span>
							<span>Verdict: {verdict}</span>
							<span>Score: {score}/100</span>
							<span>Report generated: {reportDate}</span>
						</div>
					</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
					<button
						onClick={() => navigate("/")}
						className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
					>
						<Shield className="w-5 h-5" />
						New scan
					</button>
					<button
						onClick={() => window.print()}
						className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
					>
						Print / Save as PDF
					</button>
				</div>
			</div>
		</div>
	);
}
