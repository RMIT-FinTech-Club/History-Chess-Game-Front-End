import React from "react";
import { ConnectionStatusProps } from "../types";

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className="w-full max-w-7xl mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? "Connected" : "Disconnected"}
          />
          <span className="text-sm text-white">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
};