import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { submitContact } from "../api/client";

const Contact = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			await submitContact(formData);
			setSuccess("Thank you for contacting us! We will get back to you soon.");
			setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
		} catch (err) {
			setError(err.message || "Failed to send message. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const contactInfo = [
		{
			icon: <Mail className="w-6 h-6" />,
			title: "Email Us",
			content: "support@fraudlens.com",
			subContent: "We reply within 24 hours",
			gradient: "from-blue-500 to-blue-600",
		},
		{
			icon: <Phone className="w-6 h-6" />,
			title: "Call Us",
			content: "+91 1234567890",
			subContent: "Mon-Fri from 9am to 6pm",
			gradient: "from-green-500 to-green-600",
		},
		{
			icon: <MapPin className="w-6 h-6" />,
			title: "Visit Us",
			content: "India",
			subContent: "Come say hello",
			gradient: "from-purple-500 to-purple-600",
		},
	];

	const teamMembers = [
		{ name: "Aman Yadav", role: "Full Stack Developer", enrollment: "12202531", expertise: "UPI Screenshot Detection" },
		{ name: "Saurabh Kumar Choubey", role: "Full Stack Developer", enrollment: "12205420", expertise: "Email Phishing Analysis" },
		{ name: "Alok Upadhayay", role: "Full Stack Developer", enrollment: "12211046", expertise: "SMS Fraud Detection" },
		{ name: "Surya Prakash", role: "Cybersecurity Specialist", enrollment: "12210229", expertise: "Data Protection" },
		{ name: "Ritik Kumar", role: "Software Tester", enrollment: "12207998", expertise: "Functional & API Testing" },
		{ name: "Aryan Aditya", role: "Software Tester", enrollment: "12213428", expertise: "AI Validation & Usability" },
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
						Get in Touch
					</h1>
					<p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
						Have questions? We&apos;d love to hear from you. Send us a
						message and we&apos;ll respond as soon as possible.
					</p>
				</div>
			</section>

			{/* Contact Info Cards */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
						{contactInfo.map((info, index) => (
							<div key={index} className="card text-center hover:scale-105 transition-transform duration-300">
								<div className={`bg-gradient-to-br ${info.gradient} p-4 rounded-lg w-fit mx-auto mb-4`}>
									<div className="text-white">{info.icon}</div>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
								<p className="text-gray-900 font-semibold mb-1">{info.content}</p>
								<p className="text-sm text-gray-600">{info.subContent}</p>
							</div>
						))}
					</div>

					{/* Contact Form and Info */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
						{/* Form */}
						<div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
							<h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

							{success && (
								<div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
									<CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
									<div>
										<p className="font-semibold">{success}</p>
									</div>
								</div>
							)}

							{error && (
								<div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
									<CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
									<div>
										<p className="font-semibold">{error}</p>
									</div>
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
									<input
										type="text" id="name" name="name"
										value={formData.name} onChange={handleChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
										placeholder="John Doe"
									/>
								</div>
								<div>
									<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
									<input
										type="email" id="email" name="email"
										value={formData.email} onChange={handleChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
										placeholder="john@example.com"
									/>
								</div>
								<div>
									<label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
									<input
										type="tel" id="phone" name="phone"
										value={formData.phone} onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
										placeholder="+91 1234567890"
									/>
								</div>
								<div>
									<label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
									<input
										type="text" id="subject" name="subject"
										value={formData.subject} onChange={handleChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
										placeholder="How can we help?"
									/>
								</div>
								<div>
									<label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
									<textarea
										id="message" name="message"
										value={formData.message} onChange={handleChange}
										required rows="5"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
										placeholder="Tell us more about your inquiry..."
									/>
								</div>
								<button
									type="submit"
									disabled={loading}
									className="w-full btn-primary text-lg disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{loading ? (
										<><Loader2 className="w-5 h-5 inline mr-2 animate-spin" /> Sending…</>
									) : (
										<><Send className="w-5 h-5 inline mr-2" /> Send Message</>
									)}
								</button>
							</form>
						</div>

						{/* Additional Info */}
						<div className="space-y-8">
							<div className="bg-white rounded-2xl shadow-xl p-8">
								<div className="flex items-center space-x-3 mb-6">
									<div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-lg">
										<Clock className="w-6 h-6 text-white" />
									</div>
									<h3 className="text-2xl font-bold text-gray-900">Business Hours</h3>
								</div>
								<div className="space-y-3 text-gray-700">
									<div className="flex justify-between pb-3 border-b border-gray-200">
										<span className="font-semibold">Monday - Friday</span>
										<span>9:00 AM - 6:00 PM</span>
									</div>
									<div className="flex justify-between pb-3 border-b border-gray-200">
										<span className="font-semibold">Saturday</span>
										<span>10:00 AM - 4:00 PM</span>
									</div>
									<div className="flex justify-between">
										<span className="font-semibold">Sunday</span>
										<span className="text-red-600">Closed</span>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl shadow-xl p-8 text-white">
								<div className="flex items-center space-x-3 mb-4">
									<MessageSquare className="w-8 h-8" />
									<h3 className="text-2xl font-bold">Need Quick Answers?</h3>
								</div>
								<p className="mb-6 opacity-90">
									Check out our FAQ section for instant answers to common questions about FraudLens.
								</p>
								<button className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full">
									View FAQs
								</button>
							</div>

							<div className="bg-white rounded-2xl shadow-xl p-8">
								<h3 className="text-xl font-bold text-gray-900 mb-4">Response Time</h3>
								<p className="text-gray-700 leading-relaxed">
									We aim to respond to all inquiries within <span className="font-bold text-primary-600">24 hours</span> during business days. For urgent matters, please call us directly.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Team Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Dedicated professionals working to keep you safe from digital fraud
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{teamMembers.map((member, index) => (
							<div key={index} className="card text-center hover:scale-105 transition-transform duration-300">
								<div className="bg-gradient-to-br from-primary-100 to-accent-100 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
									<span className="text-3xl font-bold text-primary-600">
										{member.name.split(" ").map((n) => n[0]).join("")}
									</span>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
								<p className="text-primary-600 font-semibold mb-2">{member.role}</p>
								<p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg mt-2">{member.expertise}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Join thousands of users protecting themselves from digital fraud with FraudLens
					</p>
					<button className="btn-primary text-lg">Start Free Trial</button>
				</div>
			</section>
		</div>
	);
};

export default Contact;