import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Shield, Zap, Crown, ArrowRight } from "lucide-react";
import { getToken } from "../api/client";

const ENROLL_URL = "/dashboard/plan?enroll=1";

const Pricing = () => {
	const [billingCycle, setBillingCycle] = useState("monthly");
	const loggedIn = !!getToken();
	const buyPlanHref = loggedIn
		? ENROLL_URL
		: `/login?redirect=${encodeURIComponent(ENROLL_URL)}`;
	const freeHref = loggedIn ? ENROLL_URL : "/signup";

	const plans = [
		{
			name: "Free",
			icon: <Shield className="w-8 h-8" />,
			price: { monthly: 0, annual: 0 },
			description: "Perfect for trying out FraudLens",
			gradient: "from-gray-500 to-gray-600",
			features: [
				{ text: "10 scans per month", included: true },
				{ text: "UPI screenshot detection", included: true },
				{ text: "SMS fraud detection", included: true },
				{ text: "Email phishing analysis", included: false },
				{ text: "API access", included: false },
				{ text: "Priority support", included: false },
				{ text: "Custom integrations", included: false },
			],
			buttonText: "Get Started",
			popular: false,
		},
		{
			name: "Professional",
			icon: <Zap className="w-8 h-8" />,
			price: { monthly: 499, annual: 4990 },
			description: "For individuals and small businesses",
			gradient: "from-primary-500 to-primary-600",
			features: [
				{ text: "500 scans per month", included: true },
				{ text: "UPI screenshot detection", included: true },
				{ text: "SMS fraud detection", included: true },
				{ text: "Email phishing analysis", included: true },
				{ text: "API access", included: true },
				{ text: "Priority support", included: false },
				{ text: "Custom integrations", included: false },
			],
			buttonText: "Buy plan",
			popular: true,
		},
		{
			name: "Enterprise",
			icon: <Crown className="w-8 h-8" />,
			price: { monthly: 1999, annual: 19990 },
			description: "For large organizations",
			gradient: "from-accent-500 to-accent-600",
			features: [
				{ text: "Unlimited scans", included: true },
				{ text: "UPI screenshot detection", included: true },
				{ text: "SMS fraud detection", included: true },
				{ text: "Email phishing analysis", included: true },
				{ text: "API access", included: true },
				{ text: "Priority support", included: true },
				{ text: "Custom integrations", included: true },
			],
			buttonText: "Contact Sales",
			popular: false,
		},
	];

	const calculateSavings = (plan) => {
		if (plan.price.monthly === 0) return 0;
		const monthlyTotal = plan.price.monthly * 12;
		const savings = monthlyTotal - plan.price.annual;
		return savings;
	};

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
						Simple, Transparent Pricing
					</h1>
					<p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed mb-6">
						Choose the plan that's right for you and start
						protecting yourself from fraud today
					</p>
					{loggedIn && (
						<p className="text-sm md:text-base max-w-2xl mx-auto mb-8">
							<Link
								to={ENROLL_URL}
								className="inline-flex items-center gap-2 font-semibold text-white underline decoration-white/60 hover:decoration-white"
							>
								Open plan enrollment (MVP demo) →
							</Link>
						</p>
					)}

					{/* Billing Toggle */}
					<div className="flex items-center justify-center space-x-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 max-w-md mx-auto">
						<button
							onClick={() => setBillingCycle("monthly")}
							className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
								billingCycle === "monthly"
									? "bg-white text-primary-600 shadow-lg"
									: "text-white hover:text-primary-100"
							}`}
						>
							Monthly
						</button>
						<button
							onClick={() => setBillingCycle("annual")}
							className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
								billingCycle === "annual"
									? "bg-white text-primary-600 shadow-lg"
									: "text-white hover:text-primary-100"
							}`}
						>
							Annual
							<span className="ml-2 text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full">
								Save 17%
							</span>
						</button>
					</div>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
						{plans.map((plan, index) => (
							<div
								key={index}
								className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
									plan.popular
										? "ring-4 ring-primary-500 lg:scale-105"
										: ""
								}`}
							>
								{/* Popular Badge */}
								{plan.popular && (
									<div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm">
										MOST POPULAR
									</div>
								)}

								<div className="p-8">
									{/* Icon and Name */}
									<div
										className={`bg-gradient-to-br ${plan.gradient} p-4 rounded-xl w-fit mb-4`}
									>
										<div className="text-white">
											{plan.icon}
										</div>
									</div>
									<h3 className="text-3xl font-bold text-gray-900 mb-2">
										{plan.name}
									</h3>
									<p className="text-gray-600 mb-6">
										{plan.description}
									</p>

									{/* Price */}
									<div className="mb-6">
										<div className="flex items-baseline">
											<span className="text-5xl font-bold text-gray-900">
												₹
												{billingCycle === "monthly"
													? plan.price.monthly
													: plan.price.annual}
											</span>
											<span className="text-gray-600 ml-2">
												/
												{billingCycle === "monthly"
													? "month"
													: "year"}
											</span>
										</div>
										{billingCycle === "annual" &&
											calculateSavings(plan) > 0 && (
												<p className="text-sm text-green-600 font-semibold mt-2">
													Save ₹
													{calculateSavings(plan)} per
													year
												</p>
											)}
									</div>

									{/* Button — Buy plan sends guests to login with redirect; signed-in users go straight to enrollment */}
									<Link
										to={
											plan.name === "Enterprise"
												? "/contact"
												: plan.name === "Professional"
												? buyPlanHref
												: freeHref
										}
										className={`block text-center w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
											plan.popular
												? "bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700"
												: "bg-gray-100 text-gray-900 hover:bg-gray-200"
										}`}
									>
										{plan.buttonText}
										<ArrowRight className="w-5 h-5 inline ml-2" />
									</Link>

									{/* Features */}
									<div className="mt-8 space-y-4">
										<h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
											What's Included:
										</h4>
										<ul className="space-y-3">
											{plan.features.map(
												(feature, fIndex) => (
													<li
														key={fIndex}
														className="flex items-start space-x-3"
													>
														{feature.included ? (
															<Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
														) : (
															<X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
														)}
														<span
															className={`text-sm ${
																feature.included
																	? "text-gray-700"
																	: "text-gray-400"
															}`}
														>
															{feature.text}
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

			{/* FAQ Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Everything you need to know about our pricing
						</p>
					</div>

					<div className="max-w-3xl mx-auto space-y-6">
						{[
							{
								question: "Can I upgrade or downgrade my plan?",
								answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
							},
							{
								question: "What payment methods do you accept?",
								answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets.",
							},
							{
								question: "Is there a free trial available?",
								answer: "Yes, Professional and Enterprise plans come with a 14-day free trial. No credit card required.",
							},
							{
								question:
									"What happens when I exceed my scan limit?",
								answer: "You will be notified when you reach 80% of your limit. You can upgrade your plan or purchase additional scans.",
							},
							{
								question: "Do you offer refunds?",
								answer: "Yes, we offer a 30-day money-back guarantee for all paid plans if you're not satisfied.",
							},
							{
								question:
									"Can I cancel my subscription anytime?",
								answer: "Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period.",
							},
						].map((faq, index) => (
							<div key={index} className="card">
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{faq.question}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{faq.answer}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-4xl md:text-5xl font-bold mb-6">
							Need a Custom Solution?
						</h2>
						<p className="text-xl mb-8 opacity-90 leading-relaxed">
							We offer custom enterprise solutions tailored to
							your organization's specific needs. Contact our
							sales team for a personalized quote.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								to="/contact"
								className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg text-center"
							>
								Contact Sales
							</Link>
							<Link
								to="/contact"
								className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg text-center"
							>
								Schedule a Demo
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Pricing;
