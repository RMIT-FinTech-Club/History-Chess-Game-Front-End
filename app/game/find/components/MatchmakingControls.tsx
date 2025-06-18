"use client";

import { Button } from "@/components/ui/button";
import { MatchmakingControlsProps } from "../types";

export default function MatchmakingControls({
  isConnected,
  isSearching,
  onFindMatchAction,
  onCancelMatchmakingAction
}: MatchmakingControlsProps) {
  return (
    <div className="flex flex-col space-y-3">
      <Button
        onClick={onFindMatchAction}
        disabled={!isConnected || isSearching}
        className="w-full !text-[1.5rem] !bg-[#F7D27F] !py-[2rem] !text-black hover:!bg-[#C09E51] hover:cursor-pointer transition-colors"
      >
        {isSearching ? "Searching..." : "Find Match"}
      </Button>
      
      {isSearching && (
        <Button
          onClick={onCancelMatchmakingAction}
          variant="destructive"
          className="w-full"
        >
          Cancel Search
        </Button>
      )}
      
      {!isConnected && (
        <p className="text-red-500 text-center">
          Not connected to server. Please refresh the page.
        </p>
      )}
    </div>
  );
}