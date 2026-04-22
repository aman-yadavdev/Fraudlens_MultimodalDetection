import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Loader2, AlertTriangle, X, Edit2, Check } from "lucide-react";
import { getAdminPlans, createAdminPlan, updateAdminPlan, deleteAdminPlan, getToken } from "../api/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function AdminPlans() {
	const navigate = useNavigate();
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionLoading, setActionLoading] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState({ name: "", slug: "", scansPerDay: "", price: "", interval: "free", isDefault: false, isActive: true });
	const [formError, setFormError] = useState("");

	useEffect(() => {
		if (!getToken()) {
			navigate("/login", { replace: true });
		}
		getPlans();
	}, [navigate]);

	const getPlans = () => {
		getAdminPlans()
			.then(setPlans)
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	};

	const resetForm = () => {
		setForm({ name: "", slug: "", scansPerDay: "", price: "", interval: "free", isDefault: false, isActive: true });
		setFormError("");
		setEditingId(null);
	};

	const handleNew = () => { resetForm(); setShowForm(true); };
	const handleEdit = (p) => {
		setEditingId(p._id);
		setForm({ name: p.name, slug: p.slug, scansPerDay: String(p.scansPerDay), price: String(p.price || ""), interval: p.interval, isDefault: p.isDefault, isActive: p.isActive });
		setShowForm(true);
	};

	const handleSave = async () => {
		if (!form.name.trim() || !form.slug.trim() || !form.scansPerDay) {
			setFormError("Name, slug, and scans per day are required.");
			return;
		}
		setActionLoading(true);
		setFormError("");
		try {
			const payload = { ...form, scansPerDay: parseInt(form.scansPerDay, 10), price: parseFloat(form.price) || 0 };
			if (editingId) {
				await updateAdminPlan(editingId, payload);
			} else {
				await createAdminPlan(payload);
			}
			await getPlans();
			setShowForm(false);
			resetForm();
		} catch (e) {
			setFormError(e.message);
		} finally {
			setActionLoading(false);
		}
	};

	const handleDelete = async (id, name) => {
		if (!window.confirm(`Deactivate plan "${name}"?`)) return;
		setActionLoading(id);
		try {
			await deleteAdminPlan(id);
			await getPlans();
		} catch (e) {
			setError(e.message);
		} finally {
			setActionLoading(null);
		}
	};

	if (loading) {
		return (
			<DashboardLayout title="Plans" subtitle="Loading…" isAdmin>
				<div className="flex justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-primary-500" />
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			title="Plans"
			subtitle="Manage subscription plans, scan limits, and pricing"
			isAdmin
		>
			<div className="space-y-6">
				{error && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
						<span>{error}</span>
					</div>
				)}

				{/* Create/Edit form */}
				{showForm && (
					<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
						<h3 className="text-lg font-semibold text-slate-900 mb-4">{editingId ? "Edit Plan" : "Create New Plan"}</h3>
						{formError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name *</label>
								<input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. Pro" />
							</div>
							<div>
								<label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Slug *</label>
								<input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. pro" />
							</div>
							<div>
								<label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Scans/day *</label>
								<input type="number" min="0" value={form.scansPerDay} onChange={(e) => setForm(f => ({ ...f, scansPerDay: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" placeholder="10" />
							</div>
							<div>
								<label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price (₹)</label>
								<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" placeholder="0" />
							</div>
							<div>
								<label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Interval</label>
								<select value={form.interval} onChange={(e) => setForm(f => ({ ...f, interval: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
									<option value="free">Free</option>
									<option value="monthly">Monthly</option>
									<option value="yearly">Yearly</option>
								</select>
							</div>
							<div className="flex flex-col gap-3 pt-5">
								<label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
									<input type="checkbox" checked={form.isDefault} onChange={(e) => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
									Default plan
								</label>
								<label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
									<input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
									Active
								</label>
							</div>
						</div>
						<div className="mt-4 flex flex-wrap gap-3">
							<button onClick={handleSave} disabled={actionLoading} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
								{actionLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Check className="w-4 h-4 inline mr-1" />}
								{editingId ? "Save changes" : "Create plan"}
							</button>
							<button onClick={() => { setShowForm(false); resetForm(); }} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
								Cancel
							</button>
						</div>
					</div>
				)}

				{/* Plans list */}
				<div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
					<div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
						<h2 className="font-semibold text-slate-900">All Plans ({plans.length})</h2>
						{!showForm && (
							<button onClick={handleNew} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
								<Plus className="w-4 h-4" /> New Plan
							</button>
						)}
					</div>
					<div className="divide-y divide-slate-100">
						{plans.length === 0 ? (
							<div className="px-5 py-12 text-center text-slate-500 text-sm">
								<Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
								No plans yet. Click "New Plan" to create one.
							</div>
						) : (
							plans.map((plan) => (
								<div key={plan._id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
											<Package className="w-6 h-6 text-slate-600" />
										</div>
										<div>
											<div className="flex items-center gap-2">
												<h3 className="font-semibold text-slate-900">{plan.name}</h3>
												{plan.isDefault && <span className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700 font-semibold">Default</span>}
												{!plan.isActive && <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600">Inactive</span>}
											</div>
											<p className="text-sm text-slate-500 mt-0.5">
												<span className="font-medium text-slate-700">{plan.scansPerDay}</span> scans/day · slug: {plan.slug}
												{plan.interval !== "free" && ` · ₹${plan.price}/${plan.interval}`}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button onClick={() => handleEdit(plan)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="Edit">
											<Edit2 className="w-4 h-4" />
										</button>
										<button onClick={() => handleDelete(plan._id, plan.name)} disabled={actionLoading === plan._id} className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50" title="Deactivate">
											{actionLoading === plan._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}