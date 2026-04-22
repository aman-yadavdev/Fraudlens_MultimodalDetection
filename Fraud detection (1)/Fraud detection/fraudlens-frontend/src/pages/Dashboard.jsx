import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	ScanSearch,
	Mail,
	MessageSquare,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Shield,
	ChevronRight,
	ImageIcon,
	Wallet,
} from "lucide-react";
import { getUserDashboard, getToken } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardQuickScanModal from "../components/dashboard/DashboardQuickScanModal";

const quickActions = [
	{
		name: "UPI Screenshot",
		description: "Verify payment proofs & detect fake screenshots",
		icon: ImageIcon,
		scan: "upi",
		color: "bg-blue-500/10 text-blue-600 border-blue-200",
	},
	{
		name: "Email Phishing",
		description: "Scan emails for phishing and deceptive content",
		icon: Mail,
		scan: "email",
		color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
	},
	{
		name: "SMS Fraud",
		description: "Check SMS for scam and suspicious messages",
		icon: MessageSquare,
		scan: "sms",
		color: "bg-amber-500/10 text-amber-600 border-amber-200",
	},
];

const securityTips = [
	"Never share OTP or UPI PIN with anyone, including support staff.",
	"Verify payment screenshots by checking transaction ID in your bank app.",
	"Be cautious of emails asking for urgent action or personal details.",
];

export default function Dashboard() {
	const navigate = useNavigate();
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [quickScan, setQuickScan] = useState(null);

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
			return;
		}
		getUserDashboard()
			.then((payload) => setData(payload))
			.catch((err) => setError(err.message || "Failed to load dashboard"))
			.finally(() => setLoading(false));
	}, [navigate]);

	if (loading) {
		return (
			<DashboardLayout
				title="Dashboard"
				subtitle="Loading…"
				isAdmin={false}
			>
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="flex flex-col items-center gap-4">
						<div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
						<p className="text-slate-500 text-sm">
							Loading your dashboard…
						</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout title="Dashboard" isAdmin={false}>
				<div className="max-w-md mx-auto text-center py-12">
					<div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-7 h-7" />
					</div>
					<p className="text-slate-700 mb-6">{error}</p>
					<button
						onClick={() => navigate("/login")}
						className="text-primary-600 font-semibold hover:underline"
					>
						Back to Login
					</button>
				</div>
			</DashboardLayout>
		);
	}

	const user = data?.user ?? {};
	const stats = data?.stats ?? {};
	const scanCount = stats?.scanCount ?? 0;
	const scanLimit = stats?.scanLimit ?? 5;
	const canScan = stats?.canScan !== false;
	const credits = user?.credits ?? 0;
	const planName = user?.planId?.name || "Free";
	const firstName = user.fullName?.split(" ")[0] || "User";
	const greeting =
		new Date().getHours() < 12
			? "Good morning"
			: new Date().getHours() < 18
				? "Good afternoon"
				: "Good evening";

	const kpis = [
		{
			label: "Scans used",
			value: `${scanCount} / ${scanLimit}`,
			sub: planName + " plan",
			icon: ScanSearch,
			trend: canScan ? "ok" : null,
		},
		{
			label: "Scans left",
			value: canScan ? String(Math.max(0, scanLimit - scanCount)) : "0",
			sub: canScan ? "Run a scan from Home" : "Upgrade for more",
			icon: Shield,
			trend: canScan ? "ok" : null,
		},
		{
			label: "Mock credits",
			value: String(credits),
			sub: "Buy more in My Plan",
			icon: Wallet,
			trend: null,
		},
		{
			label: "Last login",
			value: stats?.lastLogin
				? new Date(stats.lastLogin).toLocaleDateString()
				: "—",
			sub: "Account activity",
			icon: Clock,
			trend: null,
		},
		{
			label: "Account status",
			value: "Active",
			sub: "You're protected",
			icon: CheckCircle2,
			trend: "ok",
		},
	];

	const recentScans = data?.recentScans ?? [];
	const activityItems = [];
	recentScans.forEach((s) => {
		const I =
			s.scanType === "email"
				? Mail
				: s.scanType === "sms"
					? MessageSquare
					: ImageIcon;
		const label =
			s.scanType === "email"
				? "Email"
				: s.scanType === "sms"
					? "SMS"
					: "UPI";
		activityItems.push({
			id: `scan-${s._id}`,
			text: `${label} scan · ${s.verdict || "—"}`,
			sub: `Risk ${s.score ?? "—"}/100${
				s.preview
					? ` · ${String(s.preview).slice(0, 90)}${String(s.preview).length > 90 ? "…" : ""}`
					: ""
			}`,
			time: s.createdAt,
			icon: I,
		});
	});
	if (stats?.lastLogin) {
		activityItems.push({
			id: "login",
			text: "Signed in",
			sub: "Last session",
			time: stats.lastLogin,
			icon: Clock,
		});
	}
	if (stats?.accountCreated || user.createdAt) {
		activityItems.push({
			id: "account",
			text: "Account created",
			sub: "Welcome to FraudLens",
			time: stats?.accountCreated || user.createdAt,
			icon: CheckCircle2,
		});
	}
	activityItems.sort((a, b) => new Date(b.time) - new Date(a.time));

	return (
		<DashboardLayout
			title="Dashboard"
			subtitle={`${greeting}, ${firstName}. Here’s your fraud detection overview.`}
			isAdmin={user?.role === "admin"}
		>
			<DashboardQuickScanModal
				mode={quickScan}
				isOpen={!!quickScan}
				onClose={() => setQuickScan(null)}
			/>
			<div className="space-y-8">
				{/* Welcome + date */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<p className="text-sm text-slate-500">
							{new Date().toLocaleDateString("en-IN", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				</div>
				{/* KPI cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
					{kpis.map((kpi) => {
						const Icon = kpi.icon;
						return (
							<div
								key={kpi.label}
								className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5"
							>
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm font-medium text-slate-500">
											{kpi.label}
										</p>
										<p className="text-2xl font-semibold text-slate-900 mt-0.5">
											{kpi.value}
										</p>
										<p className="text-xs text-slate-400 mt-1">
											{kpi.sub}
										</p>
									</div>
									<div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
										<Icon className="w-5 h-5" />
									</div>
								</div>
							</div>
						);
					})}
				</div>
				{/* Upgrade CTA when no scans left
				{!canScan && (
					<div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
						<div>
							<h2 className="text-base font-semibold text-amber-900">
								Scan limit reached
							</h2>
							<p className="text-sm text-amber-700 mt-0.5">
								You've used all {scanLimit} scans on your{" "}
								{planName} plan. Upgrade to get more.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link
								to="/dashboard/plan?enroll=1"
								className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-900 font-medium rounded-lg hover:bg-amber-100 transition-colors"
							>
								View plan & enroll (demo)
							</Link>
							<Link
								to="/pricing"
								className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
							>
								Compare pricing
								<ChevronRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				)} */}
				{/* Quick actions */}
				<div>
					Ī
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-base font-semibold text-slate-900">
							Quick actions
						</h2>
						<Link
							to="/"
							className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
						>
							Run a scan
							<ChevronRight className="w-4 h-4" />
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{quickActions.map((action) => {
							const Icon = action.icon;
							return (
								<button
									type="button"
									key={action.name}
									onClick={() => setQuickScan(action.scan)}
									className="group text-left bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 flex items-start gap-4 w-full"
								>
									<div
										className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${action.color}`}
									>
										<Icon className="w-6 h-6" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
											{action.name}
										</p>
										<p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
											{action.description}
										</p>
									</div>
									<ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 shrink-0 mt-1" />
								</button>
							);
						})}
					</div>
					<p className="text-sm text-slate-500 mt-3">
						Your plan:{" "}
						<span className="font-medium text-slate-700">
							{planName}
						</span>{" "}
						· {scanCount} of {scanLimit} scans used.
						<Link
							to="/dashboard/plan"
							className="text-primary-600 hover:underline ml-2"
						>
							View plan
						</Link>
						{canScan && (
							<Link
								to="/pricing"
								className="text-primary-600 hover:underline ml-2"
							>
								Upgrade for more
							</Link>
						)}
					</p>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Recent activity */}
					<div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
						<div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-start justify-between gap-2">
							<div>
								<h2 className="text-base font-semibold text-slate-900">
									Recent activity
								</h2>
								<p className="text-sm text-slate-500">
									Signed-in sessions and scan history
								</p>
							</div>
							<Link
								to="/dashboard/history"
								className="text-sm font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap"
							>
								View all scans →
							</Link>
						</div>
						<div className="p-5">
							{activityItems.length === 0 ? (
								<p className="text-sm text-slate-600">
									No activity yet.{" "}
									<Link
										to="/"
										className="text-primary-600 font-medium hover:underline"
									>
										Run your first scan
									</Link>
								</p>
							) : (
								<ul className="space-y-0">
									{activityItems.map((item) => {
										const Icon = item.icon;
										return (
											<li
												key={item.id}
												className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0"
											>
												<div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
													<Icon className="w-4 h-4" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium text-slate-900">
														{item.text}
													</p>
													{item.sub && (
														<p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
															{item.sub}
														</p>
													)}
													<p className="text-xs text-slate-400 mt-1">
														{item.time
															? new Date(
																	item.time,
																).toLocaleString()
															: "—"}
													</p>
												</div>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					</div>

					{/* Right column: Profile + Security tips */}
					<div className="space-y-6">
						<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
							<h2 className="text-base font-semibold text-slate-900 mb-4">
								Profile summary
							</h2>
							<dl className="space-y-3 text-sm">
								<div>
									<dt className="text-slate-500">Name</dt>
									<dd className="font-medium text-slate-900">
										{user.fullName}
									</dd>
								</div>
								<div>
									<dt className="text-slate-500">Email</dt>
									<dd
										className="font-medium text-slate-900 truncate"
										title={user.email}
									>
										{user.email}
									</dd>
								</div>
								{user.phone && (
									<div>
										<dt className="text-slate-500">
											Phone
										</dt>
										<dd className="font-medium text-slate-900">
											{user.phone}
										</dd>
									</div>
								)}
								<div>
									<dt className="text-slate-500">
										Member since
									</dt>
									<dd className="font-medium text-slate-900">
										{new Date(
											user.createdAt,
										).toLocaleDateString()}
									</dd>
								</div>
							</dl>
						</div>

						<div className="bg-slate-900 rounded-xl text-white p-5">
							<h2 className="text-base font-semibold flex items-center gap-2 mb-3">
								<Shield className="w-5 h-5 text-primary-400" />
								Security tips
							</h2>
							<ul className="space-y-2 text-sm text-slate-300">
								{securityTips.map((tip, i) => (
									<li key={i} className="flex gap-2">
										<span className="text-primary-400 shrink-0">
											•
										</span>
										<span>{tip}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
