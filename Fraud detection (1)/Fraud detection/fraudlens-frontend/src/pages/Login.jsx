import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Eye, EyeOff, Shield, CheckCircle, Fingerprint, Globe } from "lucide-react";
import { login, loginWithGoogle } from "../api/client";

const Login = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/";
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
		setError("");
	};

	const doRedirect = (user) => {
		const target = redirectTo && redirectTo !== "/login" ? redirectTo : (user.role === "admin" ? "/admin/dashboard" : "/dashboard");
		navigate(target, { replace: true });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { data } = await login(formData.email, formData.password);
			localStorage.setItem("fraudlens_token", data.token);
			localStorage.setItem("fraudlens_user", JSON.stringify(data.user));
			doRedirect(data.user);
		} catch (err) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		setError("");
		setGoogleLoading(true);
		try {
			const { data } = await loginWithGoogle(credentialResponse.credential);
			localStorage.setItem("fraudlens_token", data.token);
			localStorage.setItem("fraudlens_user", JSON.stringify(data.user));
			doRedirect(data.user);
		} catch (err) {
			setError(err.message || "Google sign-in failed");
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
			<div className="w-full max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
					{/* Left Side - Decorative Panel */}
					<div className="hidden lg:flex relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between overflow-hidden">
						{/* Animated background elements */}
						<div className="absolute top-0 left-0 w-full h-full opacity-10">
							<div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
							<div
								className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
								style={{ animationDelay: "1s" }}
							></div>
						</div>

						<div className="relative z-10">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl mb-6 transform hover:scale-110 transition-transform">
								<Shield className="w-9 h-9 text-white" />
							</div>
							<h2 className="text-4xl font-bold text-white mb-4 leading-tight">
								Welcome Back to
								<br />
								<span className="text-blue-200">FraudLens</span>
							</h2>
							<p className="text-blue-100 text-lg leading-relaxed">
								Sign in to your account and continue protecting
								yourself from digital fraud with our advanced
								AI-powered detection system.
							</p>
						</div>

						{/* Feature cards */}
						<div className="relative z-10 space-y-4">
							<div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
											<CheckCircle className="w-6 h-6 text-white" />
										</div>
									</div>
									<div>
										<h3 className="text-white font-semibold text-lg mb-1">
											99.9% Accuracy
										</h3>
										<p className="text-blue-100 text-sm">
											Industry-leading fraud detection
											powered by advanced AI
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
											<Fingerprint className="w-6 h-6 text-white" />
										</div>
									</div>
									<div>
										<h3 className="text-white font-semibold text-lg mb-1">
											Secure & Private
										</h3>
										<p className="text-blue-100 text-sm">
											End-to-end encryption with zero data
											retention
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
											<Globe className="w-6 h-6 text-white" />
										</div>
									</div>
									<div>
										<h3 className="text-white font-semibold text-lg mb-1">
											50K+ Users Protected
										</h3>
										<p className="text-blue-100 text-sm">
											Trusted by individuals and
											businesses worldwide
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Decorative bottom element */}
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
					</div>

					{/* Right Side - Login Form */}
					<div className="p-8 sm:p-12 lg:p-16 flex items-center">
						<div className="w-full max-w-md mx-auto">
							{/* Logo and Title */}
							<div className="text-center mb-8">
								<div className="flex justify-center mb-4">
									<div className="bg-gradient-to-br from-primary-600 to-accent-600 p-4 rounded-2xl shadow-lg">
										<Shield className="w-10 h-10 text-white" />
									</div>
								</div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">
									Welcome Back
								</h1>
								<p className="text-gray-600">
									Sign in to your FraudLens account
								</p>
							</div>

							{error && (
								<div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
									{error}
								</div>
							)}
							{/* Login Form */}
							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Email Field */}
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Email Address
									</label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300"
											placeholder="you@example.com"
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
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
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
											className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300"
											placeholder="Enter your password"
										/>
										<button
											type="button"
											onClick={() =>
												setShowPassword(!showPassword)
											}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Remember Me and Forgot Password */}
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<input
											type="checkbox"
											id="rememberMe"
											name="rememberMe"
											checked={formData.rememberMe}
											onChange={handleChange}
											className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
										/>
										<label
											htmlFor="rememberMe"
											className="ml-2 text-sm text-gray-700"
										>
											Remember me
										</label>
									</div>
									<Link
										to="/forgot-password"
										className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
									>
										Forgot password?
									</Link>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading}
									className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
								>
									<Shield className="w-5 h-5 inline mr-2 mb-1" />
									{loading ? "Signing in…" : "Sign In"}
								</button>
							</form>

							{/* Divider */}
							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-4 bg-white text-gray-500">
										Or continue with
									</span>
								</div>
							</div>

							{/* Google Login */}
							<div className="flex flex-col items-center gap-2">
								{process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
									<div className="w-full flex justify-center">
										<GoogleLogin
											onSuccess={handleGoogleSuccess}
											onError={() => setError("Google sign-in was cancelled or failed.")}
											useOneTap={false}
											theme="outline"
											size="large"
											text="continue_with"
											shape="rectangular"
											width="320"
										/>
									</div>
								) : (
									<p className="text-sm text-slate-500">Configure REACT_APP_GOOGLE_CLIENT_ID for Google sign-in.</p>
								)}
								{googleLoading && <p className="text-sm text-slate-500">Signing in with Google…</p>}
							</div>

							{/* Sign Up Link */}
							<p className="text-center text-gray-600 text-sm mt-6">
								Don't have an account?{" "}
								<Link
									to="/signup"
									className="text-primary-600 hover:text-primary-700 font-semibold"
								>
									Sign up
								</Link>
							</p>

							{/* Terms */}
							<p className="text-center text-xs text-gray-500 mt-6">
								By signing in, you agree to our{" "}
								<Link
									to="/terms"
									className="text-primary-600 hover:underline"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									to="/privacy"
									className="text-primary-600 hover:underline"
								>
									Privacy Policy
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
