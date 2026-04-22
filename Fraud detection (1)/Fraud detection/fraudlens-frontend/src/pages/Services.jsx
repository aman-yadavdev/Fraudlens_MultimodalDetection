import React from "react";
import {
	Shield,
	Mail,
	MessageSquare,
	CheckCircle,
	TrendingUp,
	Lock,
	Zap,
} from "lucide-react";

const Services = () => {
	const services = [
		{
			icon: <Shield className="w-16 h-16" />,
			title: "UPI Screenshot Fraud Detection",
			description:
				"Advanced CNN-based image analysis to detect fake or manipulated UPI payment screenshots",
			features: [
				"Pixel-level manipulation detection",
				"Font and layout inconsistency analysis",
				"Metadata verification",
				"Real-time processing",
			],
			gradient: "from-blue-500 to-blue-600",
			responsible: "Aman Yadav",
			accuracy: "99.8%",
		},
		{
			icon: <Mail className="w-16 h-16" />,
			title: "Email Phishing Detection",
			description:
				"AI-powered analysis of email content, links, and attachments to identify phishing attempts",
			features: [
				"Suspicious link detection",
				"Header analysis",
				"Content pattern recognition",
				"Attachment scanning",
			],
			gradient: "from-purple-500 to-purple-600",
			responsible: "Saurabh Kumar Choubey",
			accuracy: "99.5%",
		},
		{
			icon: <MessageSquare className="w-16 h-16" />,
			title: "SMS Fraud Detection",
			description:
				"Natural language processing to identify scam messages and fraudulent SMS content",
			features: [
				"Urgency pattern detection",
				"Emotional manipulation analysis",
				"Suspicious link identification",
				"Sender verification",
			],
			gradient: "from-green-500 to-green-600",
			responsible: "Alok Upadhayay",
			accuracy: "99.2%",
		},
	];

	const technologies = [
		{
			name: "Convolutional Neural Networks (CNN)",
			description: "For image-based fraud detection",
			icon: <TrendingUp className="w-8 h-8" />,
		},
		{
			name: "Random Forest Models",
			description: "For structured data processing",
			icon: <Zap className="w-8 h-8" />,
		},
		{
			name: "Generative AI",
			description: "For reasoning and pattern detection",
			icon: <Shield className="w-8 h-8" />,
		},
		{
			name: "OWASP Security Standards",
			description: "For data protection and privacy",
			icon: <Lock className="w-8 h-8" />,
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
						Our Services
					</h1>
					<p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
						Comprehensive AI-powered fraud detection across multiple
						digital channels
					</p>
				</div>
			</section>

			{/* Services Grid */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="space-y-16">
						{services.map((service, index) => (
							<div
								key={index}
								className={`bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 ${
									index % 2 === 0
										? "animate-slide-up"
										: "animate-fade-in"
								}`}
							>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Icon and Title Section */}
									<div
										className={`bg-gradient-to-br ${service.gradient} p-12 flex flex-col justify-center items-center text-white`}
									>
										<div className="bg-white bg-opacity-20 p-6 rounded-2xl mb-6 backdrop-blur-sm">
											{service.icon}
										</div>
										<h2 className="text-3xl font-bold mb-4 text-center">
											{service.title}
										</h2>
										<div className="text-center space-y-2">
											<div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
												<span className="text-2xl font-bold">
													{service.accuracy}
												</span>
												<span className="text-sm ml-2">
													Accuracy
												</span>
											</div>
										</div>
									</div>

									{/* Details Section */}
									<div className="p-12 flex flex-col justify-center">
										<p className="text-lg text-gray-700 mb-6 leading-relaxed">
											{service.description}
										</p>
										<h3 className="text-xl font-bold text-gray-900 mb-4">
											Key Features:
										</h3>
										<ul className="space-y-3">
											{service.features.map(
												(feature, fIndex) => (
													<li
														key={fIndex}
														className="flex items-start space-x-3"
													>
														<CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
														<span className="text-gray-700">
															{feature}
														</span>
													</li>
												)
											)}
										</ul>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Technology Stack */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Powered by Advanced Technology
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							We use cutting-edge AI and machine learning
							technologies to provide the most accurate fraud
							detection
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{technologies.map((tech, index) => (
							<div
								key={index}
								className="card text-center hover:scale-105 transition-transform duration-300"
							>
								<div className="bg-gradient-to-br from-primary-50 to-accent-50 p-4 rounded-lg w-fit mx-auto mb-4">
									<div className="text-primary-600">
										{tech.icon}
									</div>
								</div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">
									{tech.name}
								</h3>
								<p className="text-gray-600 text-sm">
									{tech.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							How It Works
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Simple, fast, and secure fraud detection in three
							easy steps
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{
								step: "01",
								title: "Upload or Paste",
								description:
									"Upload your screenshot, paste SMS content, or forward email for analysis",
								icon: <Shield className="w-12 h-12" />,
							},
							{
								step: "02",
								title: "AI Analysis",
								description:
									"Our advanced AI models analyze the content for fraud indicators",
								icon: <TrendingUp className="w-12 h-12" />,
							},
							{
								step: "03",
								title: "Get Results",
								description:
									"Receive detailed fraud probability report with AI-generated explanations",
								icon: <CheckCircle className="w-12 h-12" />,
							},
						].map((step, index) => (
							<div key={index} className="relative">
								<div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300">
									<div className="text-6xl font-bold text-primary-100 mb-4">
										{step.step}
									</div>
									<div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-lg w-fit mb-4">
										<div className="text-white">
											{step.icon}
										</div>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-3">
										{step.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">
										{step.description}
									</p>
								</div>
								{index < 2 && (
									<div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary-300">
										<svg
											className="w-8 h-8"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Ready to Protect Yourself?
					</h2>
					<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
						Start using FraudLens today and safeguard yourself from
						digital fraud
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
							Get Started Free
						</button>
						<button className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
							View Pricing
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Services;
