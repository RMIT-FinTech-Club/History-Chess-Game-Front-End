"use client";

import { useState } from "react";
import ItemProfile from "@/components/market/ItemProfile";
import AdminAddItemCard from "@/components/market/AdminAddItemCard";

export default function Market() {
  const [profileMounted, setProfileMounted] = useState(false);
  const [addItemMounted, setAddItemMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Sword");

  function handleTurnOffProfile() {
    setProfileMounted(false);
  }

  function handleTurnOffAddItem() {
    setAddItemMounted(false);
  }

  // thanh category phía dưới
  const categories = ["Sword", "Bow", "Shield", "Helmet", "Bow"];

  return (
    <div className="relative h-[calc(100dvh-var(--navbar-height))] bg-[#050507] text-white">
      {/* ===== Modal / popup layer ===== */}
      {addItemMounted && (
        <AdminAddItemCard handleTurnOffAddItem={handleTurnOffAddItem} />
      )}

      {profileMounted && (
        <ItemProfile
          name={"Vong Gom"}
          rarity={"Legendary"}
          price={8000}
          status={"Available"}
          desc={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          }
          imgSrc={"https://iili.io/fJXUUan.png"}
          handleTurnOffProfile={handleTurnOffProfile}
        />
      )}

      {/* ===== Background grid (optional, giống mockup) ===== */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(#1b1b1b 1px, transparent 1px), linear-gradient(90deg, #1b1b1b 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ===== Main content ===== */}
      <div className="relative h-full px-6 py-5 md:px-10 md:py-7 flex flex-col gap-6">
        {/* Main content */}
        <div className="relative px-6 py-5 md:px-10 md:py-7 flex flex-col gap-6">
          {/* Header with title and search */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl [-webkit-text-stroke:0.2px_#FFFFFF] md:text-4xl font-bold italic text-[#DBB968]">
              Marketplace
            </h1>

            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full rounded-md border text-sm outline-none focus:ring-2 focus:ring-[#f6d98a]"
              />
            </div>
          </div>
        </div>

        {/* Main layout: left filter + right content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* ==== LEFT FILTER CARD ==== */}
          <aside className="w-full lg:w-64">
            <div className="rounded-3xl bg-[#413D3DB0] px-5 py-6 shadow-lg border border-[#2b2b2b] flex flex-col gap-4">
              {/* Dynasty */}
              <button className="flex items-center justify-between">
                <span>Dynasty</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Rarity */}
              <button className="flex items-center justify-between ">
                <span>Rarity</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Status */}
              <button className="flex items-center justify-between">
                <span>Status</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Price range */}
              <button className="flex items-center justify-between rounded-xl bg-[#181818] px-4 py-3 text-sm">
                <span>Price range</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Add items button → mở AdminAddItemCard */}
              <button
                onClick={() => setAddItemMounted(true)}
                className="mt-1 inline-flex items-center gap-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                  +
                </span>
                <span>Add items</span>
              </button>
            </div>
          </aside>

          {/* ==== RIGHT CONTENT ==== */}
          <section className="flex-1 flex flex-col gap-6">
            {/* Top two feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hot Combo card (click → mở ItemProfile demo) */}
              <div
                onClick={() => setProfileMounted(true)}
                className="cursor-pointer rounded-3xl border border-[#f6d98a]/60 bg-[#101010] px-5 py-4 flex flex-col justify-between shadow-lg hover:border-[#f6d98a] transition"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Hot Combo</span>
                </div>

                <div className="flex-1 rounded-2xl bg-[#18181c]" />

                <div className="mt-4 flex justify-center gap-1">
                  <span className="h-1.5 w-4 rounded-full bg-white/80" />
                  <span className="h-1.5 w-4 rounded-full bg-white/40" />
                  <span className="h-1.5 w-4 rounded-full bg-white/40" />
                </div>
              </div>

              {/* Limited items card */}
              <div className="rounded-3xl border border-[#f6d98a]/40 bg-[#101010] px-5 py-4 flex flex-col justify-between shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Limited items</span>
                </div>

                <div className="flex-1 rounded-2xl bg-[#18181c]" />

                <div className="mt-4 flex justify-center gap-1">
                  <span className="h-1.5 w-4 rounded-full bg-white/40" />
                  <span className="h-1.5 w-4 rounded-full bg-white/80" />
                  <span className="h-1.5 w-4 rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            {/* Bottom category bar */}
            <div className="ml-auto mr-auto">
              <div className="">
                <div className="">
                  {categories.map((cat, idx) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={`${cat}-${idx}`}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-1 px-6 py-2 md:px-8 md:py-3 transition ${
                          isActive
                            ? "bg-[#FFF] "
                            : "hover:bg-black/5"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* render list item theo category + search */}
              <div className="mt-4 text-xs text-gray-400">
                Showing items for: {activeCategory} (search: {search || 'none'})
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
