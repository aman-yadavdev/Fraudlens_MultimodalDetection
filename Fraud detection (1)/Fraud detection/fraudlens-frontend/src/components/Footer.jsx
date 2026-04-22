import React from "react";
import { Link } from "react-router-dom";
import {
	Shield,
	Mail,
	Phone,
	MapPin,
	Github,
	Linkedin,
	Twitter,
} from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-gray-300">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2 rounded-lg">
								<Shield className="w-6 h-6 text-white" />
							</div>
							<span className="text-xl font-bold text-white">
								FraudLens
							</span>
						</div>
						<p className="text-sm leading-relaxed">
							AI-powered fraud detection through UPI screenshots,
							SMS, and email analysis. Protecting you from digital
							fraud.
						</p>
						<div className="flex space-x-4">
							<button className="hover:text-primary-400 transition-colors">
								<Github className="w-5 h-5" />
							</button>
							<button className="hover:text-primary-400 transition-colors">
								<Linkedin className="w-5 h-5" />
							</button>
							<button className="hover:text-primary-400 transition-colors">
								<Twitter className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-white font-semibold text-lg mb-4">
							Quick Links
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/"
									className="hover:text-primary-400 transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									to="/services"
									className="hover:text-primary-400 transition-colors"
								>
									Services
								</Link>
							</li>
							<li>
								<Link
									to="/pricing"
									className="hover:text-primary-400 transition-colors"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="hover:text-primary-400 transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Services */}
					<div>
						<h3 className="text-white font-semibold text-lg mb-4">
							Our Services
						</h3>
						<ul className="space-y-2">
							<li className="hover:text-primary-400 transition-colors cursor-pointer">
								UPI Screenshot Detection
							</li>
							<li className="hover:text-primary-400 transition-colors cursor-pointer">
								Email Phishing Analysis
							</li>
							<li className="hover:text-primary-400 transition-colors cursor-pointer">
								SMS Fraud Detection
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h3 className="text-white font-semibold text-lg mb-4">
							Contact Us
						</h3>
						<ul className="space-y-3">
							<li className="flex items-center space-x-3">
								<Mail className="w-5 h-5 text-primary-400" />
								<span className="text-sm">
									support@fraudlens.com
								</span>
							</li>
							<li className="flex items-center space-x-3">
								<Phone className="w-5 h-5 text-primary-400" />
								<span className="text-sm">+91 1234567890</span>
							</li>
							<li className="flex items-center space-x-3">
								<MapPin className="w-5 h-5 text-primary-400" />
								<span className="text-sm">India</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-sm text-gray-400">
						© 2025 FraudLens. All rights reserved. | Course Code:
						CSE339
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<Link
							to="#"
							className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
						>
							Privacy Policy
						</Link>
						<Link
							to="#"
							className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
						>
							Terms of Service
						</Link>
						<Link
							to="#"
							className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
						>
							Cookie Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
