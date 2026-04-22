import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	Upload,
	MessageSquare,
	Mail,
	Shield,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Loader2,
} from "lucide-react";
import Modal from "../components/Modal";
import { predictEmail, predictSms, predictUpi, getHealth } from "../api/mlApi";
import {
	getGeminiExplanation,
	getToken,
	recordScan,
} from "../api/client";
import { extractTextFromImage } from "../utils/ocr";

const ML_NOT_RUNNING_MSG =
	"ML API is not running. Start it before scanning: run `python app.py` in the ml-api folder (port 5001).";
const LOGIN_REQUIRED_MSG = "Please log in to run a scan and view results.";

function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result.split(",")[1] || "");
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

// Toggle: "text" | "screenshot"
const Home = () => {
	const navigate = useNavigate();
	const [isDragging, setIsDragging] = useState(false);
	const [uploadedFile, setUploadedFile] = useState(null);
	const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [smsText, setSmsText] = useState("");
	const [emailText, setEmailText] = useState("");
	const [smsFile, setSmsFile] = useState(null);
	const [emailFile, setEmailFile] = useState(null);
	const [smsMode, setSmsMode] = useState("text");
	const [emailMode, setEmailMode] = useState("text");
	const [smsResult, setSmsResult] = useState(null);
	const [smsLoading, setSmsLoading] = useState(false);
	const [smsError, setSmsError] = useState(null);
	const [emailResult, setEmailResult] = useState(null);
	const [emailLoading, setEmailLoading] = useState(false);
	const [emailError, setEmailError] = useState(null);
	const [upiResult, setUpiResult] = useState(null);
	const [upiLoading, setUpiLoading] = useState(false);
	const [upiError, setUpiError] = useState(null);
	const [showExtractedSms, setShowExtractedSms] = useState(false);
	const [showExtractedEmail, setShowExtractedEmail] = useState(false);
	const [showExtractedUpi, setShowExtractedUpi] = useState(false);
	const fileInputRef = useRef(null);

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			setUploadedFile(files[0]);
		}
	};

	const handleFileSelect = (e) => {
		const files = e.target.files;
		if (files.length > 0) {
			setUploadedFile(files[0]);
		}
	};

	const handleDetectFraud = async () => {
		if (!uploadedFile) return;
		setUpiError(null);
		setUpiResult(null);
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
					content: ocrText || "",
					imageData: uploadedFile
						? await fileToBase64(uploadedFile)
						: "",
					extractedText: payload.extracted_text || ocrText,
					parsedFields: payload.parsed_fields,
					explanation: explanation || payload.explanation,
					reasons: payload.reasons || [],
				});
			}
			const screenshotDataUrl = uploadedFile
				? URL.createObjectURL(uploadedFile)
				: null;
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

	const handleVerifySms = async () => {
		const hasText = smsText.trim().length > 0;
		const hasFile = smsFile && smsFile.type?.startsWith("image/");
		if (!hasText && !hasFile) return;
		setSmsError(null);
		setSmsResult(null);
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
				const smsImageData =
					hasFile && smsFile ? await fileToBase64(smsFile) : "";
				await recordScan({
					scanType: "sms",
					verdict: payload.verdict,
					score: payload.score,
					contentPreview: (
						payload.extracted_text ||
						textToSend ||
						""
					).slice(0, 500),
					content: textToSend,
					imageData: smsImageData,
					extractedText: payload.extracted_text || textToSend,
					explanation: explanation || payload.explanation,
					reasons: payload.reasons || [],
				});
			}
			const screenshotDataUrl =
				hasFile && smsFile ? URL.createObjectURL(smsFile) : null;
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

	const handleScanEmail = async () => {
		const hasText = emailText.trim().length > 0;
		const hasFile = emailFile && emailFile.type?.startsWith("image/");
		if (!hasText && !hasFile) return;
		setEmailError(null);
		setEmailResult(null);
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
				const emailImgData =
					hasFile && emailFile ? await fileToBase64(emailFile) : "";
				await recordScan({
					scanType: "email",
					verdict: payload.verdict,
					score: payload.score,
					contentPreview: (
						payload.extracted_text ||
						textToSend ||
						""
					).slice(0, 500),
					content: textToSend,
					imageData: emailImgData,
					extractedText: payload.extracted_text || textToSend,
					explanation: explanation || payload.explanation,
					reasons: payload.reasons || [],
				});
			}
			const screenshotDataUrl =
				hasFile && emailFile ? URL.createObjectURL(emailFile) : null;
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

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
				<div className="container mx-auto px-4">
					{/* Header Text */}
					<div className="text-center mb-12 animate-fade-in">
						<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
							Protect Yourself from
							<span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent py-2">
								Digital Fraud
							</span>
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
							Upload UPI screenshots or verify your SMS/Email
							messages for fraud detection using advanced AI
							technology
						</p>
					</div>

					{/* Main Upload Card */}
					<div className="max-w-5xl mx-auto animate-slide-up">
						<div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
							<div className="flex flex-col lg:flex-row gap-8 items-center">
								{/* Upload Area */}
								<div className="flex-1 w-full">
									<div
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										onClick={() =>
											fileInputRef.current?.click()
										}
										className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
											isDragging
												? "border-primary-500 bg-primary-50 scale-105"
												: "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
										}`}
									>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/jpeg,image/jpg,image/png,image/webp"
											onChange={handleFileSelect}
											className="hidden"
										/>

										<Upload
											className={`w-16 h-16 mx-auto mb-4 ${
												isDragging
													? "text-primary-600"
													: "text-gray-400"
											}`}
										/>

										{uploadedFile ? (
											<div className="space-y-2">
												<div className="flex items-center justify-center space-x-2 text-green-600">
													<CheckCircle className="w-6 h-6" />
													<span className="font-semibold">
														{uploadedFile.name}
													</span>
												</div>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setUploadedFile(null);
													}}
													className="text-sm text-red-600 hover:text-red-700 underline"
												>
													Remove file
												</button>
											</div>
										) : (
											<>
												<h3 className="text-xl font-semibold text-gray-900 mb-2">
													Upload UPI Screenshot
												</h3>
												<p className="text-gray-600 mb-4">
													Drag and drop or click to
													select
												</p>
												<p className="text-sm text-gray-500">
													Supports: JPG, PNG, WebP
													(Max 5MB)
												</p>
											</>
										)}
									</div>

									{uploadedFile && (
										<>
											<button
												onClick={handleDetectFraud}
												disabled={upiLoading}
												className="w-full mt-6 btn-primary text-lg disabled:opacity-60 disabled:cursor-not-allowed"
											>
												{upiLoading ? (
													<>
														<Loader2 className="w-5 h-5 inline mr-2 animate-spin" />{" "}
														Analyzing...
													</>
												) : (
													<>
														<Shield className="w-5 h-5 inline mr-2" />{" "}
														Detect UPI Fraud
													</>
												)}
											</button>
											{upiError && (
												<p className="mt-3 text-sm text-red-600">
													{upiError}
												</p>
											)}
											{upiResult && (
												<div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
													<p className="font-semibold text-gray-900">
														Verdict:{" "}
														<span
															className={
																upiResult.verdict ===
																"Fraud"
																	? "text-red-600"
																	: upiResult.verdict ===
																		  "Suspicious"
																		? "text-amber-600"
																		: "text-green-600"
															}
														>
															{upiResult.verdict}
														</span>
													</p>
													<p className="text-sm text-gray-600 mt-1">
														Score: {upiResult.score}
														/100
													</p>
													{upiResult.reasons?.length >
														0 && (
														<ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
															{upiResult.reasons.map(
																(r, i) => (
																	<li key={i}>
																		{r}
																	</li>
																),
															)}
														</ul>
													)}
													{upiResult.extracted_text && (
														<div className="mt-3">
															<button
																type="button"
																onClick={() =>
																	setShowExtractedUpi(
																		(v) =>
																			!v,
																	)
																}
																className="text-sm font-medium text-primary-600 flex items-center gap-1"
															>
																{showExtractedUpi ? (
																	<ChevronUp className="w-4 h-4" />
																) : (
																	<ChevronDown className="w-4 h-4" />
																)}
																OCR extracted
																text
															</button>
															{showExtractedUpi && (
																<pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-32">
																	{
																		upiResult.extracted_text
																	}
																</pre>
															)}
														</div>
													)}
													{upiResult.parsed_fields &&
														Object.keys(
															upiResult.parsed_fields,
														).length > 0 && (
															<p className="mt-2 text-xs text-gray-500">
																Parsed:{" "}
																{JSON.stringify(
																	upiResult.parsed_fields,
																)}
															</p>
														)}
												</div>
											)}
										</>
									)}
								</div>

								{/* Side Buttons */}
								<div className="flex lg:flex-col gap-4 w-full lg:w-auto">
									<button
										onClick={() => setIsSmsModalOpen(true)}
										className="flex-1 lg:w-48 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
									>
										<MessageSquare className="w-8 h-8 mx-auto mb-2" />
										<span className="block text-lg">
											SMS
										</span>
										<span className="block text-sm opacity-90">
											Verify Message
										</span>
									</button>

									<button
										onClick={() =>
											setIsEmailModalOpen(true)
										}
										className="flex-1 lg:w-48 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
									>
										<Mail className="w-8 h-8 mx-auto mb-2" />
										<span className="block text-lg">
											Email
										</span>
										<span className="block text-sm opacity-90">
											Scan for Phishing
										</span>
									</button>
								</div>
							</div>

							{/* Instruction Line */}
							<div className="mt-8 pt-8 border-t border-gray-200">
								<p className="text-center text-gray-600 text-lg">
									<Shield className="w-5 h-5 inline text-primary-600 mr-2" />
									Upload UPI screenshot or verify your
									SMS/Email message for fraud detection
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Why Choose FraudLens?
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Advanced AI-powered protection against all types of
							digital fraud
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{
								icon: <Shield className="w-12 h-12" />,
								title: "UPI Screenshot Detection",
								description:
									"Identify fake or edited payment screenshots instantly",
								color: "from-blue-500 to-blue-600",
							},
							{
								icon: <Mail className="w-12 h-12" />,
								title: "Email Phishing Analysis",
								description:
									"Detect suspicious emails and phishing attempts",
								color: "from-purple-500 to-purple-600",
							},
							{
								icon: <MessageSquare className="w-12 h-12" />,
								title: "SMS Fraud Detection",
								description:
									"Verify SMS messages for scams and fraud",
								color: "from-green-500 to-green-600",
							},
						].map((feature, index) => (
							<div
								key={index}
								className="card group hover:scale-105 transition-transform duration-300"
							>
								<div
									className={`bg-gradient-to-br ${feature.color} p-4 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}
								>
									<div className="text-white">
										{feature.icon}
									</div>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						{[
							{ number: "99.9%", label: "Detection Accuracy" },
							{ number: "50K+", label: "Fraud Cases Prevented" },
							{ number: "24/7", label: "Real-time Protection" },
						].map((stat, index) => (
							<div key={index} className="animate-fade-in">
								<div className="text-5xl font-bold mb-2">
									{stat.number}
								</div>
								<div className="text-xl opacity-90">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							How It Works
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Simple, fast, and secure fraud detection in three
							easy steps
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{
								step: "01",
								title: "Upload or Paste",
								description:
									"Upload your screenshot, paste SMS content, or forward email for analysis",
								icon: "📤",
							},
							{
								step: "02",
								title: "AI Analysis",
								description:
									"Our advanced AI models analyze the content for fraud indicators in seconds",
								icon: "🤖",
							},
							{
								step: "03",
								title: "Get Results",
								description:
									"Receive detailed fraud probability report with AI-generated explanations",
								icon: "✅",
							},
						].map((step, index) => (
							<div key={index} className="relative">
								<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
									<div className="text-6xl font-bold text-primary-100 mb-4">
										{step.step}
									</div>
									<div className="text-6xl mb-4">
										{step.icon}
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-3">
										{step.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">
										{step.description}
									</p>
								</div>
								{index < 2 && (
									<div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary-300">
										<svg
											className="w-8 h-8"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Trust & Security Section */}
			<section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Trusted & Secure
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Your security and privacy are our top priorities
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
						{[
							{
								icon: "🔒",
								title: "End-to-End Encryption",
								description:
									"All data is encrypted during transmission and storage",
							},
							{
								icon: "🛡️",
								title: "OWASP Compliant",
								description:
									"Following industry-standard security practices",
							},
							{
								icon: "🚫",
								title: "No Data Retention",
								description:
									"Your files are deleted immediately after analysis",
							},
							{
								icon: "✓",
								title: "Privacy First",
								description:
									"We never share your data with third parties",
							},
						].map((item, index) => (
							<div
								key={index}
								className="card text-center hover:scale-105 transition-transform duration-300"
							>
								<div className="text-5xl mb-4">{item.icon}</div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">
									{item.title}
								</h3>
								<p className="text-gray-600 text-sm">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							What Our Users Say
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Join thousands of satisfied users protecting
							themselves from fraud
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{[
							{
								name: "Priya Sharma",
								role: "Small Business Owner",
								comment:
									"FraudLens saved me from a fake payment screenshot scam. The AI detection is incredibly accurate!",
								rating: 5,
							},
							{
								name: "Rahul Verma",
								role: "Freelancer",
								comment:
									"I use this daily to verify client payments. It gives me peace of mind and saves time.",
								rating: 5,
							},
							{
								name: "Anjali Patel",
								role: "E-commerce Seller",
								comment:
									"The email phishing detection caught a sophisticated scam that looked completely legitimate. Highly recommended!",
								rating: 5,
							},
						].map((testimonial, index) => (
							<div
								key={index}
								className="card hover:shadow-2xl transition-shadow duration-300"
							>
								<div className="flex items-center mb-4">
									<div className="bg-gradient-to-br from-primary-100 to-accent-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
										{testimonial.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</div>
									<div className="ml-4">
										<h4 className="font-bold text-gray-900">
											{testimonial.name}
										</h4>
										<p className="text-sm text-gray-600">
											{testimonial.role}
										</p>
									</div>
								</div>
								<div className="flex mb-3">
									{[...Array(testimonial.rating)].map(
										(_, i) => (
											<span
												key={i}
												className="text-yellow-400 text-xl"
											>
												★
											</span>
										),
									)}
								</div>
								<p className="text-gray-700 leading-relaxed italic">
									"{testimonial.comment}"
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Ready to Protect Yourself?
					</h2>
					<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
						Start detecting fraud today with our powerful AI-driven
						platform
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg transform hover:scale-105">
							Get Started Free
						</button>
						<button className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg transform hover:scale-105">
							View Pricing
						</button>
					</div>
				</div>
			</section>

			{/* SMS Modal */}
			<Modal
				isOpen={isSmsModalOpen}
				onClose={() => {
					setIsSmsModalOpen(false);
					setSmsResult(null);
					setSmsError(null);
				}}
				title="Verify SMS Message"
			>
				<div className="space-y-6">
					<div className="flex gap-2 border-b border-gray-200 pb-2">
						<button
							type="button"
							onClick={() => {
								setSmsMode("text");
								setSmsFile(null);
								setSmsResult(null);
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
								setSmsResult(null);
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
								Paste SMS Content
							</label>
							<textarea
								value={smsText}
								onChange={(e) => setSmsText(e.target.value)}
								placeholder="Paste your SMS message here..."
								className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
							/>
						</div>
					) : (
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Upload screenshot (JPG, PNG, WebP)
							</label>
							<input
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								onChange={(e) => {
									setSmsFile(e.target.files?.[0] || null);
									setSmsResult(null);
									setSmsError(null);
								}}
								className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
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
					{smsResult && (
						<div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
							<p className="font-semibold text-gray-900">
								Verdict:{" "}
								<span
									className={
										smsResult.verdict === "Scam"
											? "text-red-600"
											: "text-green-600"
									}
								>
									{smsResult.verdict}
								</span>
							</p>
							<p className="text-sm text-gray-600 mt-1">
								Score: {smsResult.score}/100
							</p>
							{smsResult.reasons?.length > 0 && (
								<ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
									{smsResult.reasons.map((r, i) => (
										<li key={i}>{r}</li>
									))}
								</ul>
							)}
							{smsResult.extracted_text && (
								<div className="mt-3">
									<button
										type="button"
										onClick={() =>
											setShowExtractedSms((v) => !v)
										}
										className="text-sm font-medium text-primary-600 flex items-center gap-1"
									>
										{showExtractedSms ? (
											<ChevronUp className="w-4 h-4" />
										) : (
											<ChevronDown className="w-4 h-4" />
										)}{" "}
										Extracted text (OCR)
									</button>
									{showExtractedSms && (
										<pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-32">
											{smsResult.extracted_text}
										</pre>
									)}
								</div>
							)}
						</div>
					)}

					<button
						onClick={handleVerifySms}
						disabled={
							(smsMode === "text" ? !smsText.trim() : !smsFile) ||
							smsLoading
						}
						className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{smsLoading ? (
							<>
								<Loader2 className="w-5 h-5 inline mr-2 animate-spin" />{" "}
								Analyzing...
							</>
						) : (
							<>
								<MessageSquare className="w-5 h-5 inline mr-2" />{" "}
								Verify SMS
							</>
						)}
					</button>
				</div>
			</Modal>

			{/* Email Modal */}
			<Modal
				isOpen={isEmailModalOpen}
				onClose={() => {
					setIsEmailModalOpen(false);
					setEmailResult(null);
					setEmailError(null);
				}}
				title="Scan Email for Phishing"
			>
				<div className="space-y-6">
					<div className="flex gap-2 border-b border-gray-200 pb-2">
						<button
							type="button"
							onClick={() => {
								setEmailMode("text");
								setEmailFile(null);
								setEmailResult(null);
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
								setEmailResult(null);
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
								Paste Email Content
							</label>
							<textarea
								value={emailText}
								onChange={(e) => setEmailText(e.target.value)}
								placeholder="Paste your email content here including headers and body..."
								className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
							/>
						</div>
					) : (
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Upload email screenshot (JPG, PNG, WebP)
							</label>
							<input
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								onChange={(e) => {
									setEmailFile(e.target.files?.[0] || null);
									setEmailResult(null);
									setEmailError(null);
								}}
								className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
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
					{emailResult && (
						<div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
							<p className="font-semibold text-gray-900">
								Verdict:{" "}
								<span
									className={
										emailResult.verdict === "Phishing"
											? "text-red-600"
											: "text-green-600"
									}
								>
									{emailResult.verdict}
								</span>
							</p>
							<p className="text-sm text-gray-600 mt-1">
								Score: {emailResult.score}/100
							</p>
							{emailResult.reasons?.length > 0 && (
								<ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
									{emailResult.reasons.map((r, i) => (
										<li key={i}>{r}</li>
									))}
								</ul>
							)}
							{emailResult.extracted_text && (
								<div className="mt-3">
									<button
										type="button"
										onClick={() =>
											setShowExtractedEmail((v) => !v)
										}
										className="text-sm font-medium text-primary-600 flex items-center gap-1"
									>
										{showExtractedEmail ? (
											<ChevronUp className="w-4 h-4" />
										) : (
											<ChevronDown className="w-4 h-4" />
										)}{" "}
										Extracted text (OCR)
									</button>
									{showExtractedEmail && (
										<pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-32">
											{emailResult.extracted_text}
										</pre>
									)}
								</div>
							)}
						</div>
					)}

					<button
						onClick={handleScanEmail}
						disabled={
							(emailMode === "text"
								? !emailText.trim()
								: !emailFile) || emailLoading
						}
						className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{emailLoading ? (
							<>
								<Loader2 className="w-5 h-5 inline mr-2 animate-spin" />{" "}
								Analyzing...
							</>
						) : (
							<>
								<Mail className="w-5 h-5 inline mr-2" /> Scan
								Email
							</>
						)}
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default Home;
