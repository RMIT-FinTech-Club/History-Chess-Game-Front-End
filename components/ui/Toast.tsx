"use client";

import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    base: "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-md flex items-center gap-3 transition-all duration-300",
    success: "bg-green-100 text-green-800 border border-green-300",
    error: "bg-red-100 text-red-800 border border-red-300",
  };

  return (
    <div className={`${styles.base} ${type === "success" ? styles.success : styles.error}`}>
      {type === "success" ? (
        <FaCheckCircle className="text-green-500 text-xl" />
      ) : (
        <FaExclamationCircle className="text-red-500 text-xl" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
}
