import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	History,
	Mail,
	MessageSquare,
	ImageIcon,
	Loader2,
	AlertTriangle,
	ArrowLeft,
	LayoutGrid,
	Eye,
	ChevronDown,
	ChevronUp,
	CreditCard,
	FileText,
	Sparkles,
	ListChecks,
} from "lucide-react";
import { getScanHistory, getScanDetail, getToken } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

function typeLabel(t) {
	if (t === "email") return "Email";
	if (t === "sms") return "SMS";
	return "UPI";
}

function TypeIcon({ type }) {
	const cls = "w-4 h-4";
	if (type === "email") return <Mail className={cls} />;
	if (type === "sms") return <MessageSquare className={cls} />;
	return <ImageIcon className={cls} />;
}

function verdictBadgeClass(verdict) {
	const v = String(verdict || "").toLowerCase();
	if (v.includes("fraud") || v.includes("phish") || v.includes("scam")) return "bg-red-100 text-red-800";
	if (v.includes("suspicious")) return "bg-amber-100 text-amber-900";
	if (v.includes("not a upi")) return "bg-slate-100 text-slate-800";
	return "bg-emerald-100 text-emerald-900";
}

function getRiskBand(score) {
	if (score >= 70) return { label: "Critical", color: "red", bar: "bg-red-500" };
	if (score >= 40) return { label: "High", color: "amber", bar: "bg-amber-500" };
	if (score >= 20) return { label: "Medium", color: "yellow", bar: "bg-yellow-500" };
	return { label: "Low", color: "emerald", bar: "bg-emerald-500" };
}

function ScanDetail({ scan, onClose }) {
	const [showExtracted, setShowExtracted] = useState(false);
	const riskBand = getRiskBand(scan.score || 0);

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between sticky top-0">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
							<TypeIcon type={scan.scanType} />
						</div>
						<div>
							<h2 className="font-bold text-slate-900">{typeLabel(scan.scanType)} Scan Detail</h2>
							<p className="text-xs text-slate-500">{new Date(scan.createdAt).toLocaleString()}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
					>
						Close
					</button>
				</div>

				<div className="p-6 space-y-6">
					{/* Verdict + Score */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
						<div className="flex items-center gap-3">
							<span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${verdictBadgeClass(scan.verdict)}`}>
								{scan.verdict || "—"}
							</span>
							<span className="text-sm text-slate-500">Risk {scan.score ?? "—"}/100</span>
						</div>
						<div className="flex-1">
							<div className="h-3 bg-slate-200 rounded-full overflow-hidden">
								<div
									className={`h-full rounded-full ${riskBand.bar}`}
									style={{ width: `${Math.min(100, scan.score || 0)}%` }}
								/>
							</div>
						</div>
						<span className={`text-xs font-semibold text-${riskBand.color}-600`}>{riskBand.label}</span>
					</div>

					{/* Content submitted */}
					{scan.content && (
						<div className="p-4 rounded-xl border border-slate-200">
							<p className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
								<FileText className="w-4 h-4 text-slate-500" />
								Submitted Content
							</p>
							<pre className="text-sm text-slate-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto">
								{scan.content}
							</pre>
						</div>
					)}

					{/* Screenshot */}
					{scan.imageData && (
						<div className="p-4 rounded-xl border border-slate-200">
							<p className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
								<ImageIcon className="w-4 h-4 text-slate-500" />
								Submitted Screenshot
							</p>
							<div className="rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden">
								<img
									src={`data:image/jpeg;base64,${scan.imageData}`}
									alt="Scanned content"
									className="w-full max-h-72 object-contain"
								/>
							</div>
						</div>
					)}

					{/* Extracted text */}
					{scan.extractedText && (
						<div className="p-4 rounded-xl border border-slate-200">
							<button
								type="button"
								onClick={() => setShowExtracted(v => !v)}
								className="flex items-center gap-2 w-full text-left"
							>
								<FileText className="w-4 h-4 text-slate-500" />
								<span className="font-semibold text-slate-800">Extracted Text</span>
								{showExtracted ? <ChevronUp className="w-4 h-4 ml-auto text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />}
							</button>
							{showExtracted && (
								<pre className="mt-2 p-3 text-xs text-slate-600 bg-white rounded-lg border border-slate-100 overflow-auto max-h-48 whitespace-pre-wrap">
									{scan.extractedText}
								</pre>
							)}
						</div>
					)}

					{/* Reasons */}
					{scan.reasons && scan.reasons.length > 0 && (
						<div className="p-4 rounded-xl border border-slate-200">
							<p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
								<ListChecks className="w-4 h-4 text-slate-500" />
								Key Findings
							</p>
							<ul className="space-y-2">
								{scan.reasons.map((r, i) => (
									<li key={i} className="flex items-start gap-2 text-sm text-slate-700">
										<span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
											{i + 1}
										</span>
										{r}
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Explanation */}
					{scan.explanation && (
						<div className="p-4 rounded-xl border border-slate-200 bg-amber-50/30">
							<p className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-amber-600" />
								AI Analysis
							</p>
							<p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{scan.explanation}</p>
						</div>
					)}

					{/* Parsed fields */}
					{scan.parsedFields && Object.keys(scan.parsedFields).length > 0 && (
						<div className="p-4 rounded-xl border border-slate-200">
							<p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
								<CreditCard className="w-4 h-4 text-slate-500" />
								Transaction Details
							</p>
							<div className="grid grid-cols-2 gap-2">
								{Object.entries(scan.parsedFields).map(([key, value]) =>
									value != null && value !== "" ? (
										<div key={key} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
											<span className="text-xs font-semibold text-slate-500 uppercase">{key.replace(/_/g, " ")}</span>
											<p className="text-sm font-medium text-slate-800 mt-0.5">{String(value)}</p>
										</div>
									) : null
								)}
							</div>
						</div>
					)}

					{/* Preview */}
					{scan.preview && (
						<div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30">
							<p className="text-xs font-semibold text-slate-500 mb-1">Preview</p>
							<p className="text-sm text-slate-600">{scan.preview}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ScanHistoryPage() {
	const navigate = useNavigate();
	const [scans, setScans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [selectedScan, setSelectedScan] = useState(null);
	const [detailLoading, setDetailLoading] = useState(false);

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
			return;
		}
	}, [navigate]);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getScanHistory(20, page)
			.then((data) => {
				if (!cancelled) {
					setScans(data?.scans || []);
					setTotal(data?.total || 0);
				}
			})
			.catch((err) => {
				if (!cancelled) setError(err.message || "Could not load history");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, [page]);

	const handleViewDetail = async (scanId) => {
		setDetailLoading(true);
		try {
			const data = await getScanDetail(scanId);
			setSelectedScan(data?.scan);
		} catch (err) {
			setError(err.message);
		} finally {
			setDetailLoading(false);
		}
	};

	const counts = useMemo(() => {
		const c = { email: 0, sms: 0, upi: 0 };
		scans.forEach((s) => {
			if (s.scanType === "email") c.email += 1;
			else if (s.scanType === "sms") c.sms += 1;
			else c.upi += 1;
		});
		return c;
	}, [scans]);

	const totalPages = Math.ceil(total / 20);

	if (loading) {
		return (
			<DashboardLayout title="Scan history" subtitle="Loading…" isAdmin={false} fullWidth>
				<div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-600">
					<Loader2 className="w-8 h-8 animate-spin text-primary-600" />
					<span>Loading your scans…</span>
				</div>
			</DashboardLayout>
		);
	}

	if (error && !scans.length) {
		return (
			<DashboardLayout title="Scan history" isAdmin={false} fullWidth>
				<div className="max-w-md mx-auto text-center py-12">
					<AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
					<p className="text-slate-700 mb-6">{error}</p>
					<button type="button" onClick={() => navigate("/dashboard")} className="text-primary-600 font-semibold hover:underline">
						Back to dashboard
					</button>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			title="Scan history"
			subtitle="Full log of all your scans — click any row to see full content, screenshot, and analysis."
			isAdmin={false}
			fullWidth
		>
			{selectedScan && <ScanDetail scan={selectedScan} onClose={() => setSelectedScan(null)} />}

			<div className="w-full flex flex-col gap-6 min-h-[calc(100vh-12rem)]">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
							<ArrowLeft className="w-4 h-4" />
							Dashboard
						</Link>
						<span className="text-slate-300">|</span>
						<Link to="/" className="text-sm font-medium text-primary-600 hover:underline">
							New scan
						</Link>
						<span className="text-slate-300">|</span>
						<Link to="/dashboard/plan?enroll=1" className="text-sm font-medium text-slate-600 hover:text-primary-600">
							My plan
						</Link>
					</div>
					<p className="text-xs text-slate-500 flex items-center gap-1">
						<LayoutGrid className="w-3.5 h-3.5" /> {total} total scans · click row to view full detail
					</p>
				</div>

				{/* Summary strip */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
					<div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5 shadow-sm">
						<p className="text-xs font-semibold uppercase text-slate-500">Total recorded</p>
						<p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{total}</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5 shadow-sm">
						<p className="text-xs font-semibold uppercase text-slate-500">UPI</p>
						<p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{counts.upi}</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5 shadow-sm">
						<p className="text-xs font-semibold uppercase text-slate-500">SMS</p>
						<p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{counts.sms}</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5 shadow-sm">
						<p className="text-xs font-semibold uppercase text-slate-500">Email</p>
						<p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{counts.email}</p>
					</div>
				</div>

				{scans.length === 0 ? (
					<div className="flex-1 rounded-2xl border border-slate-200 bg-white p-12 sm:p-16 text-center w-full min-h-[320px] flex flex-col items-center justify-center">
						<History className="w-14 h-14 text-slate-300 mb-4" />
						<h2 className="text-xl font-semibold text-slate-900">No scans recorded yet</h2>
						<p className="text-slate-600 mt-2 max-w-lg mx-auto text-sm">
							History appears when you run Email, SMS, or UPI checks while signed in. Scans are saved with full content and screenshots for later review.
						</p>
						<Link to="/" className="inline-flex mt-8 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700">
							Run a scan
						</Link>
					</div>
				) : (
					<div className="flex-1 w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
						<div className="overflow-x-auto flex-1 w-full">
							<table className="w-full text-sm table-fixed min-w-[900px]">
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50/90 text-left text-slate-600">
										<th className="px-4 sm:px-5 py-3 font-semibold w-[10%]">Type</th>
										<th className="px-4 sm:px-5 py-3 font-semibold w-[12%]">Verdict</th>
										<th className="px-4 sm:px-5 py-3 font-semibold w-[6%]">Score</th>
										<th className="px-4 sm:px-5 py-3 font-semibold w-[42%]">Preview</th>
										<th className="px-4 sm:px-5 py-3 font-semibold w-[14%]">When</th>
										<th className="px-4 sm:px-5 py-3 font-semibold w-[16%] text-center">Action</th>
									</tr>
								</thead>
								<tbody>
									{scans.map((s) => (
										<tr key={s._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
											<td className="px-4 sm:px-5 py-3 align-top">
												<span className="inline-flex items-center gap-2 text-slate-800">
													<span className="text-slate-500 shrink-0">
														<TypeIcon type={s.scanType} />
													</span>
													{typeLabel(s.scanType)}
												</span>
											</td>
											<td className="px-4 sm:px-5 py-3 align-top">
												<span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${verdictBadgeClass(s.verdict)}`}>
													{s.verdict || "—"}
												</span>
											</td>
											<td className="px-4 sm:px-5 py-3 text-slate-700 tabular-nums align-top">{s.score ?? "—"}</td>
											<td className="px-4 sm:px-5 py-3 text-slate-600 align-top">
												<span className="line-clamp-3 break-words text-xs sm:text-sm" title={s.preview || ""}>
													{s.preview || "—"}
												</span>
											</td>
											<td className="px-4 sm:px-5 py-3 text-slate-500 text-xs whitespace-nowrap align-top">
												{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
											</td>
											<td className="px-4 sm:px-5 py-3 align-top text-center">
												<button
													type="button"
													onClick={() => handleViewDetail(s._id)}
													disabled={detailLoading}
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium transition-colors disabled:opacity-50"
												>
													{detailLoading ? (
														<Loader2 className="w-3.5 h-3.5 animate-spin" />
													) : (
														<Eye className="w-3.5 h-3.5" />
													)}
													View full
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{totalPages > 1 && (
							<div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
								<span className="text-sm text-slate-500">
									Page {page} of {totalPages} · {total} scans total
								</span>
								<div className="flex gap-2">
									<button
										onClick={() => setPage(p => Math.max(1, p - 1))}
										disabled={page <= 1}
										className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
									>
										Previous
									</button>
									<button
										onClick={() => setPage(p => Math.min(totalPages, p + 1))}
										disabled={page >= totalPages}
										className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
									>
										Next
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}