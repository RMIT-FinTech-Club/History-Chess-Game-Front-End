import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Crown, Award } from "lucide-react";
import type { GameOverDialogProps } from "../types";

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  title,
  onNewGame,
  eloUpdate
}) => {
  const getResultIcon = () => {
    if (title.toLowerCase().includes("win") || title.toLowerCase().includes("won")) {
      return <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />;
    } else if (title.toLowerCase().includes("draw")) {
      return <Target className="w-16 h-16 text-blue-500 mx-auto mb-4 drop-shadow-lg" />;
    } else if (title.toLowerCase().includes("lose") || title.toLowerCase().includes("lost")) {
      return <Crown className="w-16 h-16 text-gray-500 mx-auto mb-4 drop-shadow-lg" />;
    }
    return <Target className="w-16 h-16 text-gray-500 mx-auto mb-4 drop-shadow-lg" />;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onNewGame()}>
      <DialogContent className={`sm:max-w-lg bg-[#3B3433] border-2 shadow-2xl`}>
        <DialogHeader className="text-center pb-4">
          {getResultIcon()}
          <DialogTitle className={`text-3xl font-semibold text-center text-[#F7D27F] drop-shadow-sm`}>
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* ELO Update Section */}
          {eloUpdate && (eloUpdate.whiteElo || eloUpdate.blackElo) && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                Final Ratings
              </h3>
              
              <div className="space-y-4">
                {/* White Player ELO */}
                {eloUpdate.whiteElo && (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white border-2 border-gray-800 rounded-full shadow-sm"></div>
                      <span className="font-semibold text-gray-800 text-lg">White Player</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800 text-2xl">
                        {eloUpdate.whiteElo}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">ELO</span>
                    </div>
                  </div>
                )}

                {/* Black Player ELO */}
                {eloUpdate.blackElo && (
                  <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-800 border-2 border-white rounded-full shadow-sm"></div>
                      <span className="font-semibold text-lg">Black Player</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-2xl">
                        {eloUpdate.blackElo}
                      </span>
                      <span className="text-sm text-gray-300 font-medium">ELO</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Note about rating changes */}
              <div className="mt-4 text-center">
                <p className="text-sm text-black italic">
                  Rating changes have been applied to your profile
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center pt-6">
            <Button 
              onClick={onNewGame} 
              size="lg"
              className=" text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Find New Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};