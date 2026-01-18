"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import "@/css/chessboard.css";

type Theme = {
  light: string;
  dark: string;  
};

const PRESETS: { name: string; light: string; dark:string }[] = [
  { name: "Classic",   light: "#E9B654", dark: "#d2cac2ff" },
  { name: "Forest",    light: "#E8F3E5", dark: "#4B6F44" },
  { name: "Ocean",     light: "#E6F0FA", dark: "#376996" },
  { name: "Slate",     light: "#EAEAEA", dark: "#6B7280" },
  { name: "Chocolate", light: "#FFE9C6", dark: "#8B5E34" },
  { name: "Mint",      light: "#E6FFF4", dark: "#2E7D6B" },
];

const DEFAULT_THEME: Theme = { light: "#F0D9B5", dark: "#B58863" };
const STORAGE_KEY = "chessTheme";

export default function ChessboardSettingsPage() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Theme;
        if (parsed?.light && parsed?.dark) setTheme(parsed);
      }
    } catch {}
  }, []);

  const saveTheme = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    alert("Theme saved!");
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
  };

  const vars = useMemo(
    () =>
      ({
        ["--board-light" as any]: theme.light,
        ["--board-dark" as any]: theme.dark,
        ["--board-frame" as any]: "#E9B654",
        ["--board-frame-2" as any]: "#d2cac2ff",
      }) as React.CSSProperties,
    [theme]
  );

  return (
    <div className="max-w-7xl py-8">
      {/* Reduced gap between columns to bring them closer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === LEFT COLUMN: PREVIEW === */}
        <div className="relative">
          <div className="lg:sticky lg:top-12">
            {/* Removed the "Preview" title to align the top of the board with the settings panel */}
            <div className="flex justify-center lg:justify-start lg:pl-25">
                <div className="rounded-lg border border-gray-700 p-3 shadow-2xl" style={vars}>
                  <Chessboard
                    id="historyChessBoard"
                    position="start"
                    boardWidth={500}
                    animationDuration={0}
                    arePiecesDraggable={false}
                  />
                </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: SETTINGS PANEL === */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-8 space-y-8 h-fit">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold">Chessboard Settings</h1>
            <p className="text-gray-400">
              Choose a preset or customize your own colors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PRESETS.map((p) => {
              const isSelected = theme.light === p.light && theme.dark === p.dark;
              return (
                <button
                  key={p.name}
                  onClick={() => setTheme({ light: p.light, dark: p.dark })}
                  className={`rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                  title={p.name}
                >
                  <div className="h-16 w-full rounded-md overflow-hidden flex">
                    <div className="flex-1" style={{ background: p.light }} />
                    <div className="flex-1" style={{ background: p.dark }} />
                  </div>
                  <div className="mt-2 text-sm font-medium">{p.name}</div>
                </button>
              );
            })}
          </div>

          <div>
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="px-3 py-2 rounded-md border border-gray-700 hover:border-gray-500 transition text-sm"
            >
              {showAdvanced ? "Hide Custom Colors" : "Show Custom Colors"}
            </button>

            {showAdvanced && (
              <div className="grid sm:grid-cols-2 gap-6 border border-gray-700 rounded-xl p-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Light Square</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-10 w-10 p-1 bg-transparent border border-gray-600 rounded-md cursor-pointer"
                      value={theme.light}
                      onChange={(e) => setTheme((t) => ({ ...t, light: e.target.value }))}
                    />
                    <input
                      className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm"
                      value={theme.light}
                      onChange={(e) => setTheme((t) => ({ ...t, light: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dark Square</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-10 w-10 p-1 bg-transparent border border-gray-600 rounded-md cursor-pointer"
                      value={theme.dark}
                      onChange={(e) => setTheme((t) => ({ ...t, dark: e.target.value }))}
                    />
                    <input
                      className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm"
                      value={theme.dark}
                      onChange={(e) => setTheme((t) => ({ ...t, dark: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={saveTheme}
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Save Theme
            </button>
            <button
              onClick={resetTheme}
              className="px-4 py-2 rounded-md border border-gray-700 hover:border-gray-500 transition"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}