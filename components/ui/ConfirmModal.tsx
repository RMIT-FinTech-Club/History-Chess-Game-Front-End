// components/ui/ConfirmModal.tsx
"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white text-black rounded-lg shadow-xl w-[300px] p-6">
        <p className="text-lg font-medium mb-4 text-center">{message}</p>
        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
