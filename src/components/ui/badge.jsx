import React from "react";

// Simple Badge component without external dependencies
function Badge({ children, className, variant = "default", ...props }) {
  // Define base classes
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
  // Define variant classes
  const variantClasses = {
    default: "border-transparent bg-blue-500 text-white",
    secondary: "border-transparent bg-gray-500 text-white",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "border-gray-300 text-gray-700",
    success: "border-transparent bg-green-500 text-white",
    warning: "border-transparent bg-yellow-500 text-white",
    info: "border-transparent bg-blue-500 text-white",
  };
  
  // Combine classes
  const combinedClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className || ''}`;
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

export { Badge };

