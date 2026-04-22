import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyPlan from "./pages/MyPlan";
import ScanHistoryPage from "./pages/ScanHistoryPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import AdminPayments from "./pages/AdminPayments";
import AdminContacts from "./pages/AdminContacts";
import Result from "./pages/Result";

const DASHBOARD_PATHS = [
	"/dashboard",
	"/dashboard/plan",
	"/dashboard/history",
	"/admin/dashboard",
	"/admin/users",
	"/admin/plans",
	"/admin/payments",
	"/admin/contacts",
];

function AppContent() {
	const location = useLocation();
	const isDashboard = DASHBOARD_PATHS.some((path) => location.pathname === path);

	return (
		<div className="flex flex-col min-h-screen">
			{!isDashboard && <Header />}
			<main className="flex-grow">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/services" element={<Services />} />
					<Route path="/pricing" element={<Pricing />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/dashboard/plan" element={<MyPlan />} />
					<Route path="/dashboard/history" element={<ScanHistoryPage />} />
					<Route path="/admin/dashboard" element={<AdminDashboard />} />
					<Route path="/admin/users" element={<AdminUsers />} />
					<Route path="/admin/plans" element={<AdminPlans />} />
					<Route path="/admin/payments" element={<AdminPayments />} />
					<Route path="/admin/contacts" element={<AdminContacts />} />
					<Route path="/result" element={<Result />} />
				</Routes>
			</main>
			{!isDashboard && <Footer />}
		</div>
	);
}

function App() {
	return (
		<Router>
			<ScrollToTop />
			<AppContent />
		</Router>
	);
}

export default App;
