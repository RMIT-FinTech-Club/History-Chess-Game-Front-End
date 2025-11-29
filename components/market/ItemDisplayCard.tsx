"use client";

export type MarketItem = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: "Common" | "Rare" | "Legendary";
  price: number;
  currency: string; // "ETH"
  status: "Available" | "Sold out";
};

interface ItemCardProps {
  item: MarketItem;
  onBuy?: (item: MarketItem) => void;
}

export default function ItemDisplayCard({ item, onBuy }: ItemCardProps) {
  const isAvailable = item.status === "Available";

  return (
    <div className="flex flex-col items-center justify-between rounded-[32px] border border-white/40 bg-black/80 px-10 py-8 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
      {/* IMAGE + GLOW */}
      <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #f6d98a 0%, rgba(0,0,0,0) 60%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute z-10 h-full w-full rounded-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
      </div>

      {/* NAME */}
      <h2 className="mb-3 text-2xl font-semibold text-white">{item.name}</h2>

      {/* RARITY + STATUS */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <span className="inline-flex items-center justify-center rounded-full bg-[#f6d98a] px-5 py-1 text-xs font-semibold text-black shadow-[0_4px_0_rgba(0,0,0,0.35)]">
          {item.rarity}
        </span>
        <span
          className={`text-sm font-medium ${
            isAvailable ? "text-white" : "text-neutral-500"
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* PRICE + BUY BUTTON */}
      <div className="mt-auto flex w-full items-center justify-between gap-4">
        <div className="rounded-full bg-[#e6e6e6] px-6 py-2">
          <span className="text-sm font-semibold text-[#d35a24]">
            {item.price.toLocaleString()} {item.currency}
          </span>
        </div>

        <button
          disabled={!isAvailable}
          onClick={() => isAvailable && onBuy?.(item)}
          className={`rounded-2xl px-10 py-2 text-sm font-semibold shadow-[0_4px_0_rgba(0,0,0,0.35)] ${
            isAvailable
              ? "bg-[#f6d98a] text-black hover:bg-[#eacb72]"
              : "cursor-not-allowed bg-neutral-600 text-neutral-300"
          }`}
        >
          Buy
        </button>
      </div>
    </div>
  );
}
