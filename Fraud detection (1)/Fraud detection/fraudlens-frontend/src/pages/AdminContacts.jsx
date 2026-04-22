import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Mail, CheckCircle2, Eye, Archive, MessageSquare } from "lucide-react";
import { getAdminContacts, updateAdminContact, getToken } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const STATUS_COLORS = {
	new: "bg-red-100 text-red-700",
	read: "bg-blue-100 text-blue-700",
	replied: "bg-emerald-100 text-emerald-700",
	archived: "bg-slate-100 text-slate-600",
};

const STATUS_ICONS = {
	new: Mail,
	read: Eye,
	replied: CheckCircle2,
	archived: Archive,
};

function ContactDetail({ submission, onClose, onUpdate }) {
	const [reply, setReply] = useState(submission.replyMessage || "");
	const [saving, setSaving] = useState(false);

	const handleMarkRead = async () => {
		setSaving(true);
		try {
			const updated = await updateAdminContact(submission._id, { status: "read" });
			onUpdate(updated);
		} catch (e) {
			alert("Failed: " + e.message);
		} finally {
			setSaving(false);
		}
	};

	const handleReply = async () => {
		setSaving(true);
		try {
			const updated = await updateAdminContact(submission._id, { status: "replied", replyMessage: reply });
			onUpdate(updated);
		} catch (e) {
			alert("Failed: " + e.message);
		} finally {
			setSaving(false);
		}
	};

	const handleArchive = async () => {
		setSaving(true);
		try {
			const updated = await updateAdminContact(submission._id, { status: "archived" });
			onUpdate(updated);
		} catch (e) {
			alert("Failed: " + e.message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between sticky top-0">
					<div>
						<h2 className="font-bold text-slate-900">Contact Submission</h2>
						<p className="text-xs text-slate-500">{new Date(submission.createdAt).toLocaleString()}</p>
					</div>
					<button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
						Close
					</button>
				</div>
				<div className="p-6 space-y-5">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-xs font-semibold text-slate-500 uppercase">Name</p>
							<p className="text-sm font-medium text-slate-900 mt-1">{submission.name}</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
							<p className="text-sm font-medium text-slate-900 mt-1">{submission.email}</p>
						</div>
						{submission.phone && (
							<div>
								<p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
								<p className="text-sm font-medium text-slate-900 mt-1">{submission.phone}</p>
							</div>
						)}
						<div>
							<p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
							<p className="mt-1">
								<span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[submission.status]}`}>
									{submission.status}
								</span>
							</p>
						</div>
					</div>
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase">Subject</p>
						<p className="text-sm font-medium text-slate-900 mt-1">{submission.subject}</p>
					</div>
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase mb-2">Message</p>
						<div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
							<p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{submission.message}</p>
						</div>
					</div>

					{submission.replyMessage && (
						<div>
							<p className="text-xs font-semibold text-emerald-600 uppercase mb-2 flex items-center gap-1">
								<CheckCircle2 className="w-3.5 h-3.5" />
								Your Reply {submission.repliedAt ? `(${new Date(submission.repliedAt).toLocaleString()})` : ""}
							</p>
							<div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
								<p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{submission.replyMessage}</p>
							</div>
						</div>
					)}

					{submission.status !== "replied" && submission.status !== "archived" && (
						<div className="space-y-3">
							<p className="text-xs font-semibold text-slate-500 uppercase">Reply (mock)</p>
							<textarea
								value={reply}
								onChange={(e) => setReply(e.target.value)}
								placeholder="Write your reply..."
								rows={4}
								className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
							/>
							<div className="flex flex-wrap gap-3">
								<button onClick={handleReply} disabled={saving || !reply.trim()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
									{saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <CheckCircle2 className="w-4 h-4 inline mr-1" />} Mark as Replied
								</button>
								<button onClick={handleMarkRead} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
									{saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Eye className="w-4 h-4 inline mr-1" />} Mark as Read
								</button>
								<button onClick={handleArchive} disabled={saving} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
									{saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Archive className="w-4 h-4 inline mr-1" />} Archive
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function AdminContacts() {
	const navigate = useNavigate();
	const [data, setData] = useState({ submissions: [], pagination: {}, newCount: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		const params = { page, limit: 15 };
		if (search) params.search = search;
		if (statusFilter) params.status = statusFilter;
		getAdminContacts(params)
			.then((d) => setData(d))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [navigate, page, search, statusFilter]);

	const { submissions, pagination, newCount } = data;
	const totalPages = pagination.totalPages || 1;

	const handleUpdate = (updated) => {
		setData((prev) => ({
			...prev,
			submissions: prev.submissions.map((s) => s._id === updated._id ? updated : s),
		}));
		setSelected(updated);
	};

	return (
		<DashboardLayout
			title="Contact Submissions"
			subtitle={`${newCount} unread · View and respond to contact form submissions`}
			isAdmin
		>
			{selected && (
				<ContactDetail
					submission={selected}
					onClose={() => setSelected(null)}
					onUpdate={handleUpdate}
				/>
			)}

			<div className="space-y-6">
				{error && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
						<span>{error}</span>
						<button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium">Dismiss</button>
					</div>
				)}

				{/* Summary */}
				<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
					{["new", "read", "replied", "archived"].map((s) => {
						const Icon = STATUS_ICONS[s];
						const count = s === "new" ? newCount : submissions.filter((x) => x.status === s).length;
						return (
							<div key={s} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
								<div className="flex items-center gap-2">
									<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${STATUS_COLORS[s].replace("text-", "bg-").replace("-700", "-100").replace("-600", "-100")}`}>
										<Icon className={`w-5 h-5 ${STATUS_COLORS[s].replace("bg-", "text-").replace("-100", "-700").replace("-600", "-600")}`} />
									</div>
									<div>
										<p className="text-2xl font-semibold text-slate-900">{count}</p>
										<p className="text-xs text-slate-500 capitalize">{s}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Filters */}
				<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
					<div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center">
						<div className="relative flex-1 min-w-[200px] max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search by name, email, or subject..."
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
							<option value="new">New</option>
							<option value="read">Read</option>
							<option value="replied">Replied</option>
							<option value="archived">Archived</option>
						</select>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-slate-50/80 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									<th className="px-5 py-3.5">Status</th>
									<th className="px-5 py-3.5">Name</th>
									<th className="px-5 py-3.5">Email</th>
									<th className="px-5 py-3.5">Subject</th>
									<th className="px-5 py-3.5">Message</th>
									<th className="px-5 py-3.5">Date</th>
									<th className="px-5 py-3.5 text-center">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{loading && !submissions.length ? (
									<tr>
										<td colSpan={7} className="px-5 py-12 text-center">
											<Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
											<p className="text-slate-500 text-sm">Loading contacts…</p>
										</td>
									</tr>
								) : submissions.length === 0 ? (
									<tr>
										<td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">No contact submissions found.</td>
									</tr>
								) : (
									submissions.map((s) => (
										<tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
											<td className="px-5 py-3.5">
												<span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[s.status]}`}>
													{s.status}
												</span>
											</td>
											<td className="px-5 py-3.5 text-sm font-medium text-slate-900">{s.name}</td>
											<td className="px-5 py-3.5 text-sm text-slate-600">{s.email}</td>
											<td className="px-5 py-3.5 text-sm text-slate-700 max-w-[200px] truncate" title={s.subject}>{s.subject}</td>
											<td className="px-5 py-3.5 text-xs text-slate-500 max-w-[200px]">
												<span className="line-clamp-2">{s.message}</span>
											</td>
											<td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleString()}</td>
											<td className="px-5 py-3.5 text-center">
												<button
													onClick={() => setSelected(s)}
													className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium transition-colors"
												>
													<Eye className="w-3.5 h-3.5" />
													View
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{totalPages > 1 && (
						<div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
							<span className="text-sm text-slate-500">Page {pagination.page} of {totalPages} · {pagination.total} submissions</span>
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