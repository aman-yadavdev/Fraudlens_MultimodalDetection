import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserX, Loader2, Wallet, Shield } from "lucide-react";
import {
	getAdminUsers,
	getAdminPlans,
	deactivateUser,
	updateAdminUser,
	getToken,
} from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function AdminUsers() {
	const navigate = useNavigate();
	const [list, setList] = useState({ users: [], pagination: {} });
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [actionLoading, setActionLoading] = useState(null);

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		getAdminPlans().then(setPlans).catch(() => {});
	}, [navigate]);

	useEffect(() => {
		if (!getToken()) return;
		const params = { page, limit: 10 };
		if (search) params.search = search;
		if (roleFilter) params.role = roleFilter;
		getAdminUsers(params)
			.then((res) => setList({ users: res.data.users, pagination: res.data.pagination }))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [navigate, page, search, roleFilter]);

	const handleDeactivate = (id, fullName) => {
		if (!window.confirm(`Deactivate user "${fullName}"? They will not be able to log in.`)) return;
		setActionLoading(id);
		deactivateUser(id)
			.then(() => {
				setList((prev) => ({
					...prev,
					users: prev.users.map((u) =>
						u._id === id ? { ...u, isActive: false } : u
					),
				}));
			})
			.catch((err) => setError(err.message))
			.finally(() => setActionLoading(null));
	};

	const handleToggleRole = (user) => {
		const newRole = user.role === "admin" ? "user" : "admin";
		if (!window.confirm(`Change role to "${newRole}"?`)) return;
		setActionLoading(user._id);
		updateAdminUser(user._id, { role: newRole })
			.then((res) => {
				setList((prev) => ({
					...prev,
					users: prev.users.map((u) =>
						u._id === user._id ? { ...u, role: newRole } : u
					),
				}));
			})
			.catch((err) => setError(err.message))
			.finally(() => setActionLoading(null));
	};

	const handlePlanChange = (user, planId) => {
		setActionLoading(user._id);
		updateAdminUser(user._id, { planId: planId || null })
			.then(() => {
				const plan = plans.find((p) => p._id === planId);
				setList((prev) => ({
					...prev,
					users: prev.users.map((u) =>
						u._id === user._id ? { ...u, planId: plan || null } : u
					),
				}));
			})
			.catch((err) => setError(err.message))
			.finally(() => setActionLoading(null));
	};

	const handleDailyLimitChange = (user, value) => {
		const limit = value === "" ? null : parseInt(value, 10);
		setActionLoading(user._id);
		updateAdminUser(user._id, { dailyScanLimit: limit })
			.then((res) => {
				setList((prev) => ({
					...prev,
					users: prev.users.map((u) =>
						u._id === user._id ? { ...u, dailyScanLimit: limit } : u
					),
				}));
			})
			.catch((err) => setError(err.message))
			.finally(() => setActionLoading(null));
	};

	const handleCreditsChange = (user, value) => {
		const credits = Math.max(0, parseInt(value, 10) || 0);
		setActionLoading(user._id);
		updateAdminUser(user._id, { credits })
			.then(() => {
				setList((prev) => ({
					...prev,
					users: prev.users.map((u) =>
						u._id === user._id ? { ...u, credits } : u
					),
				}));
			})
			.catch((err) => setError(err.message))
			.finally(() => setActionLoading(null));
	};

	const { users, pagination } = list;
	const totalPages = pagination.totalPages || 1;

	return (
		<DashboardLayout
			title="User Management"
			subtitle={`${pagination.total ?? 0} users · Search, manage accounts, set scan limits & credits`}
			isAdmin
		>
			<div className="space-y-6">
				{error && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
						<span>{error}</span>
						<button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium">Dismiss</button>
					</div>
				)}

				<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
					<div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center">
						<div className="relative flex-1 min-w-[200px] max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search by name or email..."
								value={search}
								onChange={(e) => { setSearch(e.target.value); setPage(1); }}
								className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50/50"
							/>
						</div>
						<select
							value={roleFilter}
							onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
							className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-slate-50/50 text-slate-700"
						>
							<option value="">All roles</option>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-slate-50/80 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									<th className="px-5 py-3.5">Name</th>
									<th className="px-5 py-3.5">Email</th>
									<th className="px-5 py-3.5">Role</th>
									<th className="px-5 py-3.5">Plan</th>
									<th className="px-5 py-3.5">Daily Limit</th>
									<th className="px-5 py-3.5">Credits</th>
									<th className="px-5 py-3.5">Status</th>
									<th className="px-5 py-3.5">Joined</th>
									<th className="px-5 py-3.5 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{loading && !users.length ? (
									<tr>
										<td colSpan={9} className="px-5 py-12 text-center">
											<Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
											<p className="text-slate-500 text-sm">Loading users…</p>
										</td>
									</tr>
								) : users.length === 0 ? (
									<tr>
										<td colSpan={9} className="px-5 py-12 text-center text-slate-500 text-sm">No users found.</td>
									</tr>
								) : (
									users.map((u) => (
										<tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
											<td className="px-5 py-3.5 font-medium text-slate-900">{u.fullName}</td>
											<td className="px-5 py-3.5 text-slate-600 text-sm">{u.email}</td>
											<td className="px-5 py-3.5">
												<button
													onClick={() => handleToggleRole(u)}
													disabled={actionLoading === u._id}
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${u.role === "admin" ? "bg-violet-100 text-violet-700 hover:bg-violet-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
												>
													{actionLoading === u._id ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <Shield className="w-3.5 h-3.5 shrink-0" />}
													{u.role}
												</button>
											</td>
											<td className="px-5 py-3.5">
												<select
													value={u.planId?._id || ""}
													onChange={(e) => handlePlanChange(u, e.target.value || null)}
													disabled={actionLoading === u._id}
													className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 disabled:opacity-50 max-w-[130px]"
												>
													<option value="">Free (default)</option>
													{plans.map((p) => (
														<option key={p._id} value={p._id}>
															{p.name} ({p.scansPerDay}/day)
														</option>
													))}
												</select>
											</td>
											<td className="px-5 py-3.5">
												<input
													type="number"
													min="1"
													placeholder={u.planId?.scansPerDay || "—" }
													defaultValue={u.dailyScanLimit ?? ""}
													onBlur={(e) => handleDailyLimitChange(u, e.target.value)}
													disabled={actionLoading === u._id}
													title="Override daily scan limit (leave empty to use plan default)"
													className="w-20 text-sm border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 disabled:opacity-50"
												/>
											</td>
											<td className="px-5 py-3.5">
												<div className="flex items-center gap-1">
													<Wallet className="w-3.5 h-3.5 text-slate-400" />
													<input
														type="number"
														min="0"
														defaultValue={u.credits ?? 0}
														onBlur={(e) => handleCreditsChange(u, e.target.value)}
														disabled={actionLoading === u._id}
														title="Set mock credits balance"
														className="w-16 text-sm border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 disabled:opacity-50"
													/>
												</div>
											</td>
											<td className="px-5 py-3.5">
												<span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
													{u.isActive ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="px-5 py-3.5 text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
											<td className="px-5 py-3.5 text-right">
												{u.isActive && (
													<button
														onClick={() => handleDeactivate(u._id, u.fullName)}
														disabled={actionLoading === u._id}
														className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{actionLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
														Deactivate
													</button>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{totalPages > 1 && (
						<div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
							<span className="text-sm text-slate-500">Page {pagination.page} of {totalPages} · {pagination.total} users</span>
							<div className="flex gap-2">
								<button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-700">Previous</button>
								<button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-700">Next</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}