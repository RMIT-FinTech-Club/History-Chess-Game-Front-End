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
    <div className="relative mt-15 flex flex-col items-center justify-between rounded-[32px] border border-[#FFFFFF] bg-[#1A1919CC] px-3 pt-20 pb-5 ">
      {/* IMAGE + GLOW */} 
      <div className="absolute -top-20 mb-6 flex h-45 w-45 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #f6d98a 0%, rgba(0,0,0,0) 60%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute -top-2 z-10 h-45 w-45 rounded-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
      </div>

      {/* NAME */}
      <h2 className="mb-1 text-2xl font-semibold text-white">{item.name}</h2>

      {/* RARITY + STATUS */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <span className="inline-flex items-center justify-center rounded-full bg-[#F1C40F] px-5 py-1 text-xs font-semibold text-black shadow-[0_4px_0_rgba(0,0,0,0.35)]">
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
      <div className="mt-auto flex w-full items-center justify-around gap-15">
        <div className="rounded-full bg-[#e6e6e6] px-4 py-1">
          <span className="text-sm font-semibold text-[#d35a24]">
            {item.price.toLocaleString()} {item.currency}
          </span>
        </div>

        <button
          disabled={!isAvailable}
          onClick={() => isAvailable && onBuy?.(item)}
          className={`rounded-2xl px-10 py-2 text-sm font-semibold shadow-[0_4px_0_rgba(0,0,0,0.35)]`}
          style={
            isAvailable
              ? {
                  background:
                    "#DBB968",
                  color: "#09090B",
                }
              : {
                  background:
                    "linear-gradient(90deg, #555555 0%, #777777 100%)",
                  color: "#CCCCCC",
                }
          }
        >
          Buy
        </button>
      </div>
    </div>
  );
}
