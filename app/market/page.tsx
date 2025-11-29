"use client";

import { useState } from "react";
import ItemProfile from "@/components/market/ItemProfile";
import AdminAddItemCard from "@/components/market/AdminAddItemCard";
import LimitedItemsCarousel from "@/components/market/LimitedItemsCarousel";
import ComboItemsCarousel from "@/components/market/ComboItemsCarousel";
import ItemDisplayCard, {
  MarketItem,
} from "@/components/market/ItemDisplayCard";

// thanh category phía dưới
const categories = ["Badge", "Hat", "Bracelet", "Effect"];
type Category = (typeof categories)[number];

// mock data – sau này thay bằng data từ backend
const allItems: (MarketItem & { category: Category })[] = [
  {
    id: "1",
    name: "Vong Gom",
    imageUrl: "https://iili.io/fJXUUan.png",
    rarity: "Legendary",
    price: 80000,
    currency: "ETH",
    status: "Available",
    category: "Bracelet",
  },
  // thêm item khác...
];

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

  const filteredItems = allItems.filter((item) => {
    const matchCategory = item.category === activeCategory;
    const matchSearch = search
      ? item.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

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
        <div className="relative flex flex-col gap-6">
          {/* Header with title and search */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl [-webkit-text-stroke:0.5px_#FFFFFF] md:text-4xl font-bold italic text-[#DBB968]">
              Marketplace
            </h1>

            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="text-sm focus:ring-2 focus:ring-[#f6d98a]"
                style={{
                  background: "#27272A",
                  color: "#fff",
                  padding: "0.5rem 1.5rem",
                }}
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
              <button
                className="flex items-center justify-start gap-2"
                style={{ background: "none", padding: "0.2rem 0.5rem" }}
              >
                <span>Dynasty</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Rarity */}
              <button
                className="flex items-center justify-start gap-2"
                style={{ background: "none", padding: "0.2rem 0.5rem" }}
              >
                <span>Rarity</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Status */}
              <button
                className="flex items-center justify-start gap-2"
                style={{ background: "none", padding: "0.2rem 0.5rem" }}
              >
                <span>Status</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Price range */}
              <button
                className="flex items-center justify-start gap-2"
                style={{ background: "none", padding: "0.2rem 0.5rem" }}
              >
                <span>Price range</span>
                <span className="text-xs opacity-70">▼</span>
              </button>

              {/* Add items button → mở AdminAddItemCard */}
              <button
                onClick={() => setAddItemMounted(true)}
                className="mt-1 inline-flex items-center gap-2"
                style={{ background: "none", padding: "0.2rem 0.5rem" }}
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
              <div>
                <ComboItemsCarousel
                  items={[
                    {
                      id: "1",
                      nameItem1: "Vong Gom",
                      nameItem2: "Item 2",
                      imageUrl: "https://iili.io/fJXUUan.png",
                    },
                    {
                      id: "2",
                      nameItem1: "Vong",
                      nameItem2: "Item 2",
                      imageUrl: "https://iili.io/fJXUUan.png",
                    },
                    // ...
                  ]}
                />
              </div>

              {/* Limited items card */}
              <div
                onClick={() => setProfileMounted(true)}
                className="cursor-pointer"
              >
                <LimitedItemsCarousel
                  items={[
                    {
                      id: "1",
                      name: "Vong Gom",
                      imageUrl: "https://iili.io/fJXUUan.png",
                    },
                    {
                      id: "2",
                      name: "Vong",
                      imageUrl: "https://iili.io/fJXUUan.png",
                    },
                    // ...
                  ]}
                />
              </div>
            </div>

            {/* Category bar */}
            <div className="mx-auto">
              <div className="bg-[linear-gradient(to_bottom,#D9D9D9_80%,#B7872D)] border rounded-3xl px-2 py-2 flex items-center gap-4">
                {categories.map((cat, idx) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={`${cat}-${idx}`}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: "0.5rem 3rem",
                        background: isActive ? "#000000" : "none",
                        color: isActive ? "#E3AB40" : "#000000",
                        borderRadius: "1rem",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items grid */}
            <div className="flex flex-wrap gap-6">
              {filteredItems.map((item) => (
                <ItemDisplayCard
                  key={item.id}
                  item={item}
                  onBuy={(i) => console.log("Buy clicked", i)}
                />
              ))}

              {filteredItems.length === 0 && (
                <p className="text-xs text-gray-500">No items found.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
