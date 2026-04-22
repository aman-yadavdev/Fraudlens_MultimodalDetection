import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Users,
	UserCheck,
	Shield,
	ScanSearch,
	AlertTriangle,
	Server,
	ChevronRight,
	TrendingUp,
	DollarSign,
	Mail,
} from "lucide-react";
import { getAdminDashboard, getToken } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function AdminDashboard() {
	const navigate = useNavigate();
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
			return;
		}
		getAdminDashboard()
			.then((payload) => setData(payload))
			.catch((err) => {
				setError(err.message || "Failed to load admin dashboard");
				if (err.message && err.message.toLowerCase().includes("admin")) {
					navigate("/dashboard", { replace: true });
				}
			})
			.finally(() => setLoading(false));
	}, [navigate]);

	if (loading) {
		return (
			<DashboardLayout title="Admin Overview" subtitle="Loading…" isAdmin>
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="flex flex-col items-center gap-4">
						<div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
						<p className="text-slate-500 text-sm">Loading admin dashboard…</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (error && !data) {
		return (
			<DashboardLayout title="Admin Overview" isAdmin>
				<div className="max-w-md mx-auto text-center py-12">
					<div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-7 h-7" />
					</div>
					<p className="text-slate-700 mb-6">{error}</p>
					<Link to="/dashboard" className="text-primary-600 font-semibold hover:underline">
						Back to Dashboard
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	const stats = data?.stats ?? {};
	const recentUsers = data?.recentUsers ?? [];

	return (
		<DashboardLayout
			title="Admin Overview"
			subtitle="Platform metrics, user management, and system health"
			isAdmin
		>
			<div className="space-y-8">
				{/* User stats */}
				<div>
					<h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">User metrics</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500">Total users</p>
									<p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.totalUsers}</p>
									<p className="text-xs text-slate-400 mt-1">Registered accounts</p>
								</div>
								<div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
									<Users className="w-5 h-5" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500">Active users</p>
									<p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.activeUsers}</p>
									<p className="text-xs text-slate-400 mt-1">Can sign in</p>
								</div>
								<div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
									<UserCheck className="w-5 h-5" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500">Admins</p>
									<p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.totalAdmins}</p>
									<p className="text-xs text-slate-400 mt-1">With admin access</p>
								</div>
								<div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
									<Shield className="w-5 h-5" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Platform stats */}
				<div>
					<h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Platform analytics</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500">Total scans</p>
									<p className="text-2xl font-semibold text-slate-900 mt-0.5">{stats.totalScans ?? "—"}</p>
									<p className="text-xs text-slate-400 mt-1">All time</p>
								</div>
								<div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
									<ScanSearch className="w-5 h-5" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500">Revenue (mock)</p>
									<p className="text-2xl font-semibold text-slate-900 mt-0.5">₹{(stats.totalRevenue ?? 0).toFixed(0)}</p>
									<p className="text-xs text-slate-400 mt-1">From mock payments</p>
								</div>
								<div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
									<DollarSign className="w-5 h-5" />
								</div>
							</div>
						</div>
						<Link to="/admin/contacts" className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500">Contact inquiries</p>
									<p className="text-2xl font-semibold text-primary-700 mt-0.5">View</p>
									<p className="text-xs text-slate-400 mt-1">Manage submissions</p>
								</div>
								<div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
									<Mail className="w-5 h-5" />
								</div>
							</div>
						</Link>
					</div>
				</div>

				{/* System status + Recent users */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
						<div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
							<Server className="w-5 h-5 text-slate-500" />
							<h2 className="text-base font-semibold text-slate-900">System status</h2>
						</div>
						<div className="p-5">
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-emerald-500" />
								<span className="text-sm font-medium text-slate-700">All systems operational</span>
							</div>
							<p className="text-xs text-slate-500 mt-3">API and database connectivity verified.</p>
						</div>
					</div>

					<div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
						<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
							<h2 className="text-base font-semibold text-slate-900">Recent users</h2>
							<Link to="/admin/users" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
								View all <ChevronRight className="w-4 h-4" />
							</Link>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-slate-50/80 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
										<th className="px-5 py-3">Name</th>
										<th className="px-5 py-3">Email</th>
										<th className="px-5 py-3">Role</th>
										<th className="px-5 py-3">Status</th>
										<th className="px-5 py-3">Joined</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{recentUsers.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">No users yet.</td>
										</tr>
									) : (
										recentUsers.map((u) => (
											<tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
												<td className="px-5 py-3.5 font-medium text-slate-900">{u.fullName}</td>
												<td className="px-5 py-3.5 text-slate-600 text-sm">{u.email}</td>
												<td className="px-5 py-3.5">
													<span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${u.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
														{u.role}
													</span>
												</td>
												<td className="px-5 py-3.5">
													<span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
														{u.isActive ? "Active" : "Inactive"}
													</span>
												</td>
												<td className="px-5 py-3.5 text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}