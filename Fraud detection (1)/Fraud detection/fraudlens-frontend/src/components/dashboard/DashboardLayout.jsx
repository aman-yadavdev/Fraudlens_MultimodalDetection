import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Shield,
	LayoutDashboard,
	Users,
	Settings,
	LogOut,
	Menu,
	X,
	ChevronRight,
	Bell,
	User,
	CreditCard,
	History,
	Receipt,
	Mail,
} from "lucide-react";

const userNav = [
	{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
	{ name: "Scan history", path: "/dashboard/history", icon: History },
	{ name: "My plan", path: "/dashboard/plan", icon: CreditCard },
];

const adminNav = [
	{ name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
	{ name: "User Management", path: "/admin/users", icon: Users },
	{ name: "Plans", path: "/admin/plans", icon: Settings },
	{ name: "Payments", path: "/admin/payments", icon: Receipt },
	{ name: "Contacts", path: "/admin/contacts", icon: Mail },
];

export default function DashboardLayout({ children, title, subtitle, isAdmin, fullWidth }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const navItems = isAdmin ? adminNav : userNav;
	const homePath = isAdmin ? "/admin/dashboard" : "/dashboard";

	let user = null;
	try {
		const u = localStorage.getItem("fraudlens_user");
		if (u) user = JSON.parse(u);
	} catch (_) {}

	const handleLogout = () => {
		localStorage.removeItem("fraudlens_token");
		localStorage.removeItem("fraudlens_user");
		navigate("/", { replace: true });
	};

	return (
		<div className="min-h-screen bg-slate-50/80 flex">
			{/* Sidebar overlay (mobile) */}
			<div
				className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity ${
					sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				onClick={() => setSidebarOpen(false)}
				aria-hidden="true"
			/>

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between h-16 px-5 border-b border-slate-700/50">
					<Link to="/" className="flex items-center gap-2.5 font-semibold text-white">
						<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500/20 text-primary-400">
							<Shield className="w-5 h-5" />
						</div>
						<span>FraudLens</span>
					</Link>
					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto py-4 px-3">
					<div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
						{isAdmin ? "Admin" : "Main"}
					</div>
					<ul className="space-y-0.5">
						{navItems.map((item) => {
							const isActive = location.pathname === item.path;
							const Icon = item.icon;
							return (
								<li key={item.path}>
									<Link
										to={item.path}
										onClick={() => setSidebarOpen(false)}
										className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
											isActive
												? "bg-primary-600 text-white"
												: "text-slate-300 hover:bg-slate-800 hover:text-white"
										}`}
									>
										<Icon className="w-5 h-5 shrink-0 opacity-90" />
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>

					{isAdmin && (
						<>
							<div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mt-6 mb-2">
								Account
							</div>
							<ul className="space-y-0.5">
								<li>
									<Link
										to="/dashboard"
										onClick={() => setSidebarOpen(false)}
										className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
									>
										<LayoutDashboard className="w-5 h-5 shrink-0" />
										User Dashboard
										<ChevronRight className="w-4 h-4 ml-auto opacity-60" />
									</Link>
								</li>
							</ul>
						</>
					)}
				</nav>

				<div className="p-3 border-t border-slate-700/50">
					<div className="px-3 py-2 rounded-lg bg-slate-800/50">
						<p className="text-xs font-medium text-slate-400">Logged in as</p>
						<p className="text-sm font-medium text-white truncate">{user?.fullName || user?.email}</p>
						<p className="text-xs text-slate-500 truncate">{user?.email}</p>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex-1 flex flex-col min-w-0 lg:pl-64">
				{/* Top bar */}
				<header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
					>
						<Menu className="w-6 h-6" />
					</button>

					<div className="flex-1 min-w-0 mx-4">
						<h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
						{subtitle && (
							<p className="text-sm text-slate-500 truncate">{subtitle}</p>
						)}
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
							title="Notifications"
						>
							<Bell className="w-5 h-5" />
							<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
						</button>

						<div className="relative">
							<button
								type="button"
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 text-slate-700"
							>
								<div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
									<User className="w-4 h-4" />
								</div>
								<span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
									{user?.fullName?.split(" ")[0] || "Account"}
								</span>
							</button>

							{userMenuOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setUserMenuOpen(false)}
										aria-hidden="true"
									/>
									<div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-20">
										<div className="px-4 py-3 border-b border-slate-100">
											<p className="text-sm font-medium text-slate-900 truncate">{user?.fullName}</p>
											<p className="text-xs text-slate-500 truncate">{user?.email}</p>
										</div>
										<Link
											to="/dashboard"
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
										>
											<LayoutDashboard className="w-4 h-4" />
											My Dashboard
										</Link>
										<Link
											to="/dashboard/history"
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
										>
											<History className="w-4 h-4" />
											Scan history
										</Link>
										<Link
											to="/dashboard/plan"
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
										>
											<CreditCard className="w-4 h-4" />
											View plan & usage
										</Link>
										{isAdmin && (
											<Link
												to="/admin/dashboard"
												onClick={() => setUserMenuOpen(false)}
												className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
											>
												<Settings className="w-4 h-4" />
												Admin Overview
											</Link>
										)}
										<button
											type="button"
											onClick={() => {
												setUserMenuOpen(false);
												handleLogout();
											}}
											className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
										>
											<LogOut className="w-4 h-4" />
											Sign out
										</button>
									</div>
								</>
							)}
						</div>
					</div>
				</header>

				{/* Page content */}
				<main
					className={`flex-1 flex flex-col min-h-0 ${fullWidth ? "p-3 sm:p-4 lg:px-6 lg:py-5 xl:px-8 xl:py-6" : "p-4 lg:p-8"}`}
				>
					<div className={fullWidth ? "w-full flex-1 min-h-0" : ""}>{children}</div>
				</main>
			</div>
		</div>
	);
}
