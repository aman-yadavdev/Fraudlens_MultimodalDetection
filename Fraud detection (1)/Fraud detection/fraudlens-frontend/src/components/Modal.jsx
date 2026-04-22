import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, wide }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
				onClick={onClose}
			></div>

			{/* Modal Content */}
			<div
				className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in ${
					wide ? "max-w-4xl" : "max-w-2xl"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-900">
						{title}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Body */}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
