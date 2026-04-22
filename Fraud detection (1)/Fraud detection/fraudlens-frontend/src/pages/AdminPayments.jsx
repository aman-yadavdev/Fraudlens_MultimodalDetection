import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, CreditCard, DollarSign, TrendingUp, ChevronRight } from "lucide-react";
import { getAdminPayments, getToken } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const STATUS_COLORS = {
	completed: "bg-emerald-100 text-emerald-700",
	pending: "bg-amber-100 text-amber-700",
	failed: "bg-red-100 text-red-700",
	refunded: "bg-slate-100 text-slate-700",
};

export default function AdminPayments() {
	const navigate = useNavigate();
	const [data, setData] = useState({ payments: [], pagination: {}, revenue: {} });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		const params = { page, limit: 15 };
		if (search) params.search = search;
		if (statusFilter) params.status = statusFilter;
		getAdminPayments(params)
			.then((d) => setData(d))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [navigate, page, search, statusFilter]);

	const { payments, pagination, revenue } = data;
	const totalPages = pagination.totalPages || 1;

	return (
		<DashboardLayout
			title="Payment History"
			subtitle="Mock payments, credits purchases, and plan enrollments."
			isAdmin
		>
			<div className="space-y-6">
				{error && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
						<span>{error}</span>
						<button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium">Dismiss</button>
					</div>
				)}

				{/* Revenue summary */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500">Total Revenue (mock)</p>
								<p className="text-2xl font-semibold text-slate-900 mt-0.5">₹{revenue?.total?.toFixed(2) || "0.00"}</p>
								<p className="text-xs text-slate-400 mt-1">{revenue?.count || 0} transactions</p>
							</div>
							<div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
								<DollarSign className="w-5 h-5" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500">Completed</p>
								<p className="text-2xl font-semibold text-slate-900 mt-0.5">{revenue?.count || 0}</p>
								<p className="text-xs text-slate-400 mt-1">Successful payments</p>
							</div>
							<div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
								<TrendingUp className="w-5 h-5" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500">All Transactions</p>
								<p className="text-2xl font-semibold text-slate-900 mt-0.5">{pagination?.total || 0}</p>
								<p className="text-xs text-slate-400 mt-1">Including mock/payments</p>
							</div>
							<div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
								<CreditCard className="w-5 h-5" />
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
					<div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center">
						<div className="relative flex-1 min-w-[200px] max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search by transaction ID or description..."
								value={search}
								onChange={(e) => { setSearch(e.target.value); setPage(1); }}
								className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50/50"
							/>
						</div>
						<select
							value={statusFilter}
							onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
							className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-slate-50/50 text-slate-700"
						>
							<option value="">All statuses</option>
							<option value="completed">Completed</option>
							<option value="pending">Pending</option>
							<option value="failed">Failed</option>
							<option value="refunded">Refunded</option>
						</select>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-slate-50/80 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									<th className="px-5 py-3.5">Transaction ID</th>
									<th className="px-5 py-3.5">User</th>
									<th className="px-5 py-3.5">Amount</th>
									<th className="px-5 py-3.5">Credits</th>
									<th className="px-5 py-3.5">Plan</th>
									<th className="px-5 py-3.5">Method</th>
									<th className="px-5 py-3.5">Status</th>
									<th className="px-5 py-3.5">Date</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{loading && !payments.length ? (
									<tr>
										<td colSpan={8} className="px-5 py-12 text-center">
											<Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
											<p className="text-slate-500 text-sm">Loading payments…</p>
										</td>
									</tr>
								) : payments.length === 0 ? (
									<tr>
										<td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-sm">No payments found.</td>
									</tr>
								) : (
									payments.map((p) => (
										<tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
											<td className="px-5 py-3.5 text-sm font-mono text-slate-700">{p.transactionId}</td>
											<td className="px-5 py-3.5">
												<p className="text-sm font-medium text-slate-900">{p.user?.fullName || "—"}</p>
												<p className="text-xs text-slate-500">{p.user?.email || "—"}</p>
											</td>
											<td className="px-5 py-3.5 text-sm font-semibold text-slate-900">₹{p.amount?.toFixed(2) || "0.00"}</td>
											<td className="px-5 py-3.5 text-sm text-slate-700">{p.creditsAdded || p.credits || "—"}</td>
											<td className="px-5 py-3.5 text-sm text-slate-700">{p.planName || (p.planId?.name || "—")}</td>
											<td className="px-5 py-3.5 text-xs text-slate-500">{p.paymentMethod || "—"}</td>
											<td className="px-5 py-3.5">
												<span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[p.status] || STATUS_COLORS.pending}`}>
													{p.status}
												</span>
											</td>
											<td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{totalPages > 1 && (
						<div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
							<span className="text-sm text-slate-500">Page {pagination.page} of {totalPages} · {pagination.total} payments</span>
							<div className="flex gap-2">
								<button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-700">Previous</button>
								<button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-700">Next</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}