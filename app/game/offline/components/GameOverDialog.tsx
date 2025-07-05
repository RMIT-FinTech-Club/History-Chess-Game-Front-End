import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameOverDialogProps } from "../types";

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  title,
  message,
  onNewGame,
}) => (
  <Dialog open={open} onOpenChange={(open) => !open && onNewGame()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex justify-center text-xl sm:text-3xl">
          {title}
        </DialogTitle>
      </DialogHeader>
      <p className="text-center text-base sm:text-lg">{message}</p>
      <div className="flex justify-center space-x-4">
        <Button onClick={onNewGame} variant="destructive">
          New Game
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);