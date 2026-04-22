import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Mail,
	Lock,
	Eye,
	EyeOff,
	Shield,
	User,
	Phone,
	CheckCircle,
	Zap,
	Bell,
} from "lucide-react";
import { register } from "../api/client";

const Signup = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		agreeToTerms: false,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match!");
			return;
		}
		if (!formData.agreeToTerms) {
			setError("Please agree to the Terms of Service and Privacy Policy");
			return;
		}
		setError("");
		setLoading(true);
		try {
			const { data } = await register({
				fullName: formData.fullName,
				email: formData.email,
				phone: formData.phone || undefined,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
			});
			localStorage.setItem("fraudlens_token", data.token);
			localStorage.setItem("fraudlens_user", JSON.stringify(data.user));
			navigate("/dashboard", { replace: true });
		} catch (err) {
			setError(err.message || "Signup failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 py-12">
			<div className="w-full max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">
					{/* Left Side - Signup Form */}
					<div className="p-8 sm:p-12 lg:p-16 flex items-center justify-center order-2 lg:order-1">
						<div className="w-full max-w-md mx-auto">
							{/* Logo and Title */}
							<div className="text-center mb-8">
								<div className="flex justify-center mb-4">
									<div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
										<Shield className="w-10 h-10 text-white" />
									</div>
								</div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">
									Create Account
								</h1>
								<p className="text-gray-600">
									Join FraudLens and start protecting yourself
								</p>
							</div>

							{error && (
								<div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
									{error}
								</div>
							)}
							{/* Signup Form */}
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Full Name Field */}
								<div>
									<label
										htmlFor="fullName"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Full Name
									</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
										<input
											type="text"
											id="fullName"
											name="fullName"
											value={formData.fullName}
											onChange={handleChange}
											required
											className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
											placeholder="John Doe"
										/>
									</div>
								</div>

								{/* Email Field */}
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Email Address
									</label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
											placeholder="you@example.com"
										/>
									</div>
								</div>

								{/* Phone Field */}
								<div>
									<label
										htmlFor="phone"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Phone Number
									</label>
									<div className="relative">
										<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
										<input
											type="tel"
											id="phone"
											name="phone"
											value={formData.phone}
											onChange={handleChange}
											required
											className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
											placeholder="+1 (555) 000-0000"
										/>
									</div>
								</div>

								{/* Password Field */}
								<div>
									<label
										htmlFor="password"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
										<input
											type={
												showPassword
													? "text"
													: "password"
											}
											id="password"
											name="password"
											value={formData.password}
											onChange={handleChange}
											required
											className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
											placeholder="Create a strong password"
										/>
										<button
											type="button"
											onClick={() =>
												setShowPassword(!showPassword)
											}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Confirm Password Field */}
								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Confirm Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
										<input
											type={
												showConfirmPassword
													? "text"
													: "password"
											}
											id="confirmPassword"
											name="confirmPassword"
											value={formData.confirmPassword}
											onChange={handleChange}
											required
											className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
											placeholder="Confirm your password"
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(
													!showConfirmPassword
												)
											}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
										>
											{showConfirmPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Terms Checkbox */}
								<div className="flex items-start">
									<input
										type="checkbox"
										id="agreeToTerms"
										name="agreeToTerms"
										checked={formData.agreeToTerms}
										onChange={handleChange}
										className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
									/>
									<label
										htmlFor="agreeToTerms"
										className="ml-2 text-sm text-gray-700"
									>
										I agree to the{" "}
										<Link
											to="/terms"
											className="text-purple-600 hover:text-purple-700 font-semibold"
										>
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link
											to="/privacy"
											className="text-purple-600 hover:text-purple-700 font-semibold"
										>
											Privacy Policy
										</Link>
									</label>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading}
									className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
								>
									<Shield className="w-5 h-5 inline mr-2 mb-1" />
									{loading ? "Creating account…" : "Create Account"}
								</button>
							</form>

							{/* Divider */}
							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-4 bg-white text-gray-500">
										Or sign up with
									</span>
								</div>
							</div>

							{/* Social Signup Buttons */}
							<div className="grid grid-cols-2 gap-4">
								<button className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
									<svg
										className="w-5 h-5 mr-2"
										viewBox="0 0 24 24"
									>
										<path
											fill="#4285F4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34A853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#FBBC05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#EA4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									<span className="text-sm font-semibold text-gray-700">
										Google
									</span>
								</button>
								<button className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
									<svg
										className="w-5 h-5 mr-2"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="text-sm font-semibold text-gray-700">
										GitHub
									</span>
								</button>
							</div>

							{/* Login Link */}
							<p className="text-center text-gray-600 text-sm mt-6">
								Already have an account?{" "}
								<Link
									to="/login"
									className="text-purple-600 hover:text-purple-700 font-semibold"
								>
									Sign in
								</Link>
							</p>
						</div>
					</div>

					{/* Right Side - Decorative Panel */}
					<div className="hidden lg:flex relative bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 p-8 lg:p-12 flex-col justify-center overflow-hidden order-1 lg:order-2 min-h-[600px]">
						{/* Animated background elements */}
						<div className="absolute top-0 left-0 w-full h-full opacity-10">
							<div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
							<div
								className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
								style={{ animationDelay: "1s" }}
							></div>
						</div>

						<div className="relative z-10 space-y-8">
							<div>
								<div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl mb-6 transform hover:scale-110 transition-transform">
									<Shield className="w-9 h-9 text-white" />
								</div>
								<h2 className="text-4xl font-bold text-white mb-4 leading-tight">
									Start Your Journey to
									<br />
									<span className="text-pink-200">
										Digital Safety
									</span>
								</h2>
								<p className="text-pink-100 text-lg leading-relaxed">
									Join thousands of users protecting
									themselves from digital fraud with our
									cutting-edge AI technology.
								</p>
							</div>

							{/* Feature cards */}
							<div className="space-y-4">
								<div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0">
											<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
												<CheckCircle className="w-6 h-6 text-white" />
											</div>
										</div>
										<div>
											<h3 className="text-white font-semibold text-lg mb-1">
												Free to Start
											</h3>
											<p className="text-pink-100 text-sm">
												Begin with our free plan and
												upgrade as you grow
											</p>
										</div>
									</div>
								</div>

								<div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0">
											<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
												<Zap className="w-6 h-6 text-white" />
											</div>
										</div>
										<div>
											<h3 className="text-white font-semibold text-lg mb-1">
												Instant Protection
											</h3>
											<p className="text-pink-100 text-sm">
												Start detecting fraud
												immediately after signup
											</p>
										</div>
									</div>
								</div>

								<div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0">
											<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
												<Bell className="w-6 h-6 text-white" />
											</div>
										</div>
										<div>
											<h3 className="text-white font-semibold text-lg mb-1">
												Real-time Alerts
											</h3>
											<p className="text-pink-100 text-sm">
												Get notified instantly when
												fraud is detected
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Decorative bottom element */}
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
