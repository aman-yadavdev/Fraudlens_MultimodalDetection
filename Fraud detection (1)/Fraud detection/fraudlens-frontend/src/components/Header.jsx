import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();
	const token = localStorage.getItem("fraudlens_token");
	let user = null;
	try {
		const u = localStorage.getItem("fraudlens_user");
		if (u) user = JSON.parse(u);
	} catch (_) {}

	const navLinks = [
		{ name: "Home", path: "/" },
		{ name: "Services", path: "/services" },
		{ name: "Pricing", path: "/pricing" },
		{ name: "Contact", path: "/contact" },
	];

	const isActive = (path) => location.pathname === path;

	return (
		<header className="bg-white shadow-md sticky top-0 z-50">
			<nav className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2 group">
						<div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
							<Shield className="w-6 h-6 text-white" />
						</div>
						<span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
							FraudLens
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className={`text-base font-medium transition-colors duration-300 ${
									isActive(link.path)
										? "text-primary-600 border-b-2 border-primary-600"
										: "text-gray-700 hover:text-primary-600"
								}`}
							>
								{link.name}
							</Link>
						))}
					</div>

					{/* Auth Buttons / Logged-in */}
					<div className="hidden md:flex items-center space-x-4">
						{token && user ? (
							<>
								<Link
									to="/dashboard"
									className="text-primary-600 hover:text-primary-700 font-semibold px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
								>
									Dashboard
								</Link>
								{user.role === "admin" && (
									<Link
										to="/admin/dashboard"
										className="text-gray-700 hover:text-primary-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
									>
										Admin
									</Link>
								)}
								<Link
									to="/"
									onClick={() => {
										localStorage.removeItem("fraudlens_token");
										localStorage.removeItem("fraudlens_user");
									}}
									className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
								>
									Logout
								</Link>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="text-primary-600 hover:text-primary-700 font-semibold px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
					>
						{isMenuOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden mt-4 pb-4 animate-fade-in">
						<div className="flex flex-col space-y-4">
							{navLinks.map((link) => (
								<Link
									key={link.path}
									to={link.path}
									onClick={() => setIsMenuOpen(false)}
									className={`text-base font-medium py-2 px-4 rounded-lg transition-colors duration-300 ${
										isActive(link.path)
											? "bg-primary-50 text-primary-600"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									{link.name}
								</Link>
							))}
							<div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
								{token && user ? (
									<>
										<Link
											to="/dashboard"
											onClick={() => setIsMenuOpen(false)}
											className="text-primary-600 font-semibold py-2 px-4 text-center rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-all"
										>
											Dashboard
										</Link>
										{user.role === "admin" && (
											<Link
												to="/admin/dashboard"
												onClick={() => setIsMenuOpen(false)}
												className="text-gray-700 font-medium py-2 px-4 text-center rounded-lg hover:bg-gray-100 transition-all"
											>
												Admin
											</Link>
										)}
										<Link
											to="/"
											onClick={() => {
												localStorage.removeItem("fraudlens_token");
												localStorage.removeItem("fraudlens_user");
												setIsMenuOpen(false);
											}}
											className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 text-center rounded-lg hover:bg-gray-200 transition-all"
										>
											Logout
										</Link>
									</>
								) : (
									<>
										<Link
											to="/login"
											onClick={() => setIsMenuOpen(false)}
											className="text-primary-600 font-semibold py-2 px-4 text-center rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-all"
										>
											Login
										</Link>
										<Link
											to="/signup"
											onClick={() => setIsMenuOpen(false)}
											className="bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold py-2 px-4 text-center rounded-lg shadow-md hover:shadow-lg transition-all"
										>
											Sign Up
										</Link>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>
		</header>
	);
};

export default Header;
