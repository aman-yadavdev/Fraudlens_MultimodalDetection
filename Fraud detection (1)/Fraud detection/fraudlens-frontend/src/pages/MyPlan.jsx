import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
	Shield,
	Zap,
	Crown,
	Check,
	ChevronRight,
	AlertTriangle,
	Loader2,
	Building2,
	User,
	Briefcase,
	Sparkles,
	CreditCard,
	Wallet,
	Plus,
} from "lucide-react";
import { getToken, getUsage, getPlans, selectPlanMock, refreshSessionUser, addCredits } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const ACCOUNT_TYPE_KEY = "fraudlens_mvp_account_type";

const ACCOUNT_TYPES = [
	{ id: "individual", label: "Individual", description: "Personal fraud checks", icon: User },
	{ id: "business", label: "Business", description: "Teams & operators", icon: Briefcase },
	{ id: "enterprise", label: "Enterprise", description: "Org-wide (demo)", icon: Building2 },
];

const CREDIT_PACKAGES = [
	{ credits: 10, price: 49, label: "10 Credits", sub: "₹4.90/scan" },
	{ credits: 25, price: 99, label: "25 Credits", sub: "₹3.96/scan", popular: true },
	{ credits: 50, price: 179, label: "50 Credits", sub: "₹3.58/scan" },
	{ credits: 100, price: 299, label: "100 Credits", sub: "₹2.99/scan" },
];

export default function MyPlan() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [usage, setUsage] = useState(null);
	const [plans, setPlans] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	const [accountType, setAccountType] = useState(() => localStorage.getItem(ACCOUNT_TYPE_KEY) || "individual");
	const [enrollOpen, setEnrollOpen] = useState(false);
	const [creditsOpen, setCreditsOpen] = useState(false);
	const [pendingPlan, setPendingPlan] = useState(null);
	const [enrollStep, setEnrollStep] = useState("idle");
	const [enrollError, setEnrollError] = useState("");
	const [creditProcessing, setCreditProcessing] = useState(false);
	const [creditSuccess, setCreditSuccess] = useState("");
	const [creditError, setCreditError] = useState("");

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		if (searchParams.get("enroll") === "1") {
			setEnrollOpen(true);
			const q = new URLSearchParams(searchParams);
			q.delete("enroll");
			setSearchParams(q, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	useEffect(() => {
		localStorage.setItem(ACCOUNT_TYPE_KEY, accountType);
	}, [accountType]);

	const loadData = () => {
		return Promise.all([getUsage(), getPlans()]).then(([u, p]) => {
			setUsage(u);
			setPlans(Array.isArray(p) ? p : []);
		});
	};

	useEffect(() => {
		let cancelled = false;
		loadData()
			.catch((err) => {
				if (!cancelled) setError(err.message || "Failed to load plan");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, []);

	const runMockEnrollment = async () => {
		if (!pendingPlan?._id) return;
		setEnrollError("");
		setEnrollStep("processing");
		await new Promise((r) => setTimeout(r, 1600));
		try {
			await selectPlanMock({ planId: pendingPlan._id });
			await refreshSessionUser();
			await loadData();
			setEnrollStep("success");
			setPendingPlan(null);
		} catch (e) {
			setEnrollError(e.message || "Enrollment failed");
			setEnrollStep("review");
		}
	};

	const handleBuyCredits = async (pkg) => {
		setCreditError("");
		setCreditSuccess("");
		setCreditProcessing(true);
		await new Promise((r) => setTimeout(r, 1500));
		try {
			await addCredits(pkg.price, pkg.credits);
			await loadData();
			setCreditSuccess(`${pkg.credits} credits added to your account!`);
		} catch (e) {
			setCreditError(e.message || "Purchase failed");
		} finally {
			setCreditProcessing(false);
		}
	};

	if (loading) {
		return (
			<DashboardLayout title="My plan" subtitle="Loading…" isAdmin={false} fullWidth>
				<div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-600">
					<Loader2 className="w-8 h-8 animate-spin text-primary-600" />
					<span>Loading your subscription…</span>
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout title="My plan" isAdmin={false} fullWidth>
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

	const plan = usage?.plan;
	const scanCount = usage?.scanCount ?? 0;
	const scanLimit = usage?.scanLimit ?? 5;
	const canScan = usage?.canScan !== false;
	const credits = usage?.credits ?? 0;
	const pct = scanLimit > 0 ? Math.min(100, Math.round((scanCount / scanLimit) * 100)) : 0;

	const currentSlug = plan?.slug || "free";
	const currentName = plan?.name || "Free";

	const tierIcon = (slug) => {
		const s = (slug || "").toLowerCase();
		if (s.includes("enterprise")) return Crown;
		if (s.includes("pro") || s.includes("paid")) return Zap;
		return Shield;
	};

	const accountLabel = ACCOUNT_TYPES.find((a) => a.id === accountType)?.label || "Individual";

	let isAdminUser = false;
	try {
		isAdminUser = JSON.parse(localStorage.getItem("fraudlens_user") || "{}")?.role === "admin";
	} catch {
		isAdminUser = false;
	}

	return (
		<DashboardLayout
			title="My plan & billing"
			subtitle="Usage, plan enrollment, and mock credits purchase flow."
			isAdmin={false}
			fullWidth
		>
			<div className="w-full flex flex-col gap-6 lg:gap-8 min-h-[calc(100vh-12rem)]">
				{/* Top strip */}
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active plan</p>
						<div className="mt-2 flex items-center gap-2">
							{React.createElement(tierIcon(currentSlug), { className: "w-8 h-8 text-primary-600" })}
							<span className="text-xl font-bold text-slate-900">{currentName}</span>
						</div>
						<p className="text-sm text-slate-500 mt-1 truncate" title={plan?.slug}>
							Slug: {currentSlug}
						</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Daily scans</p>
						<p className="text-2xl font-bold text-slate-900 mt-1">
							{scanCount} <span className="text-slate-400 font-normal">/</span> {scanLimit}
						</p>
						<div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
								style={{ width: `${pct}%` }}
							/>
						</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mock credits</p>
						<p className="text-2xl font-bold text-slate-900 mt-1">{credits}</p>
						<p className="text-xs text-slate-500 mt-1">Can be used for scans</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account type (demo)</p>
						<p className="text-lg font-semibold text-slate-900 mt-2">{accountLabel}</p>
						<p className="text-xs text-slate-500 mt-1">Used in mock checkout</p>
					</div>
					<div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-5 flex flex-col justify-center gap-3">
						<div className="flex items-center gap-2">
							<Wallet className="w-5 h-5 text-primary-600" />
							<p className="text-sm font-medium text-primary-900">Need more scans?</p>
						</div>
						<button
							type="button"
							onClick={() => setCreditsOpen(true)}
							className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:underline text-sm"
						>
							<Plus className="w-4 h-4" />
							Buy credits (mock)
						</button>
						<button
							type="button"
							onClick={() => { setEnrollOpen(true); setEnrollStep("idle"); setPendingPlan(null); }}
							className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:underline text-sm"
						>
							<Sparkles className="w-4 h-4" />
							Upgrade plan
						</button>
					</div>
				</div>

				{/* Main grid */}
				<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 flex-1 min-h-0 w-full">
					<div className="xl:col-span-8 space-y-6 min-w-0">
						<div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 w-full">
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
								<div>
									<p className="text-sm text-white/70 uppercase tracking-wide">Current subscription (live data)</p>
									<h2 className="text-2xl sm:text-3xl font-bold mt-1 flex flex-wrap items-center gap-3">
										{React.createElement(tierIcon(currentSlug), { className: "w-10 h-10 opacity-90" })}
										{currentName}
									</h2>
									<p className="text-white/80 mt-2 max-w-2xl">
										{plan?.interval === "free" || !plan?.price
											? "No billing on file — use plan enrollment below to switch tiers (mock)."
											: `Billing: ₹${plan.price} / ${plan.interval || "period"}`}
									</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<Link to="/pricing" className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100">
										Pricing
									</Link>
									<Link to="/dashboard/history" className="inline-flex items-center justify-center px-5 py-2.5 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10">
										Scan history
									</Link>
								</div>
							</div>
							{!canScan && (
								<div className="mt-6 p-4 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-50 text-sm">
									<strong className="text-white">Daily limit reached.</strong> Use credits or mock enrollment to pick a higher scan tier.
								</div>
							)}
						</div>

						{/* Credits purchase */}
						<div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full">
							<div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold text-slate-900">Buy scan credits (mock)</h3>
									<p className="text-sm text-slate-500">Add credits to your account without upgrading your plan. No real payment.</p>
								</div>
								<button type="button" onClick={() => setCreditsOpen(v => !v)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
									{creditsOpen ? "Collapse" : "Expand"}
								</button>
							</div>
							{creditsOpen && (
								<div className="p-5 sm:p-8">
									{creditError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{creditError}</div>}
									{creditSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">{creditSuccess}</div>}
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{CREDIT_PACKAGES.map((pkg) => (
											<div key={pkg.credits} className={`rounded-xl border p-4 text-center relative ${pkg.popular ? "border-primary-400 bg-primary-50/40" : "border-slate-200 bg-slate-50/30"}`}>
												{pkg.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-primary-600 text-white px-3 py-0.5 rounded-full font-semibold">Popular</span>}
												<p className="font-bold text-slate-900 text-lg mt-1">{pkg.label}</p>
												<p className="text-2xl font-bold text-primary-700 mt-2">₹{pkg.price}</p>
												<p className="text-xs text-slate-500 mt-1">{pkg.sub}</p>
												<button
													type="button"
													onClick={() => handleBuyCredits(pkg)}
													disabled={creditProcessing}
													className="mt-4 w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												>
													{creditProcessing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Buy (mock)"}
												</button>
											</div>
										))}
									</div>
									<p className="text-xs text-slate-400 mt-4 text-center">Credits are added instantly to your account (mock flow, no real payment).</p>
								</div>
							)}
						</div>

						{/* Mock plan enrollment */}
						<div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full">
							<div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold text-slate-900">Mock plan enrollment</h3>
									<p className="text-sm text-slate-500">
										Choose account type, pick a workspace plan, confirm — assigns your user in DB (no payment).
									</p>
								</div>
								<button
									type="button"
									onClick={() => { setEnrollOpen(v => !v); setEnrollStep("idle"); setPendingPlan(null); setEnrollError(""); }}
									className="text-sm font-semibold text-primary-600 hover:text-primary-700"
								>
									{enrollOpen ? "Collapse" : "Expand"}
								</button>
							</div>

							{enrollOpen && (
								<div className="p-5 sm:p-8 space-y-8">
									<section>
										<h4 className="text-sm font-semibold text-slate-700 mb-3">1. Account type (demo label)</h4>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
											{ACCOUNT_TYPES.map((a) => {
												const Icon = a.icon;
												const sel = accountType === a.id;
												return (
													<button
														key={a.id}
														type="button"
														onClick={() => setAccountType(a.id)}
														className={`text-left rounded-xl border p-4 transition-all ${sel ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200" : "border-slate-200 hover:border-slate-300"}`}
													>
														<Icon className={`w-6 h-6 mb-2 ${sel ? "text-primary-600" : "text-slate-500"}`} />
														<p className="font-semibold text-slate-900">{a.label}</p>
														<p className="text-xs text-slate-500 mt-1">{a.description}</p>
													</button>
												);
											})}
										</div>
									</section>

									<section>
										<h4 className="text-sm font-semibold text-slate-700 mb-3">2. Select scan plan</h4>
										{plans.length === 0 ? (
											<p className="text-slate-600 text-sm">No plans in database. Seed plans from Admin → Plans.</p>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
												{plans.map((p) => {
													const Icon = tierIcon(p.slug);
													const isCurrent = p._id === plan?._id || p.slug === currentSlug;
													return (
														<div key={p._id} className={`rounded-xl border p-5 flex flex-col h-full ${isCurrent ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 bg-slate-50/30"}`}>
															<div className="flex items-start gap-3">
																<div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
																	<Icon className="w-5 h-5 text-slate-700" />
																</div>
																<div>
																	<p className="font-bold text-slate-900">{p.name}</p>
																	<p className="text-sm text-slate-600">{p.scansPerDay} scans/day</p>
																	<p className="text-xs text-slate-500 mt-1">slug: {p.slug}</p>
																</div>
															</div>
															<div className="mt-4 flex-1" />
															{isCurrent ? (
																<span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
																	<Check className="w-4 h-4" /> Current plan
																</span>
															) : (
																<button
																	type="button"
																	onClick={() => { setPendingPlan(p); setEnrollStep("review"); setEnrollError(""); }}
																	className="w-full mt-2 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
																>
																	Select for demo checkout
																</button>
															)}
														</div>
													);
												})}
											</div>
										)}
									</section>

									{enrollStep === "review" && pendingPlan && (
										<section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
											<h4 className="text-sm font-semibold text-amber-900 mb-3">3. Review (mock)</h4>
											<ul className="text-sm text-slate-800 space-y-2">
												<li><strong>Account type:</strong> {accountLabel}</li>
												<li><strong>Plan:</strong> {pendingPlan.name} ({pendingPlan.scansPerDay} scans/day)</li>
												<li><strong>Price (mock):</strong> ₹0 — Demo, no gateway</li>
											</ul>
											{enrollError && <p className="text-sm text-red-600 mt-3">{enrollError}</p>}
											<div className="mt-4 flex flex-wrap gap-3">
												<button type="button" onClick={runMockEnrollment} className="px-5 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700">
													Confirm demo enrollment
												</button>
												<button type="button" onClick={() => { setPendingPlan(null); setEnrollStep("idle"); }} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-white">
													Cancel
												</button>
											</div>
										</section>
									)}

									{enrollStep === "processing" && (
										<div className="flex items-center gap-3 text-slate-700 py-4">
											<Loader2 className="w-6 h-6 animate-spin text-primary-600" />
											<span>Processing mock payment & assigning plan…</span>
										</div>
									)}

									{enrollStep === "success" && (
										<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 text-sm">
											<strong>Done.</strong> Your plan was updated. Daily scan limits reset from the new plan.
											<button type="button" onClick={() => setEnrollStep("idle")} className="block mt-3 text-primary-700 font-semibold underline">
												Close notice
											</button>
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Sidebar */}
					<div className="xl:col-span-4 space-y-4 min-w-0">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
							<h3 className="font-semibold text-slate-900">How this works</h3>
							<ul className="mt-3 text-sm text-slate-600 space-y-2 list-decimal list-inside">
								<li>Plans come from Admin / seed data (MongoDB).</li>
								<li>Plan enrollment calls POST /api/plans/select.</li>
								<li>Credits are added via POST /api/usage/add-credits.</li>
								<li>No real payment or Stripe involved.</li>
							</ul>
							{isAdminUser && (
								<Link to="/admin/plans" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
									Admin plans <ChevronRight className="w-4 h-4" />
								</Link>
							)}
						</div>
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
							<h3 className="font-semibold text-slate-900">Quick links</h3>
							<ul className="mt-3 space-y-2 text-sm">
								<li><Link to="/" className="text-primary-600 hover:underline">Run a scan (home)</Link></li>
								<li><Link to="/dashboard" className="text-primary-600 hover:underline">Dashboard</Link></li>
								<li><Link to="/pricing" className="text-primary-600 hover:underline">Public pricing page</Link></li>
								<li><Link to="/dashboard/history" className="text-primary-600 hover:underline">Scan history</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}