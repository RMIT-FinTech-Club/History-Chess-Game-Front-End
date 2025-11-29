"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  imageUrl: string;
};

interface Props {
  items: Item[];
}

export default function LimitedItemsCarousel({ items }: Props) {
  const [index, setIndex] = useState(0);

  // auto slide mỗi 3s
  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[index];

  return (
    <div className="rounded-3xl border border-[#f6d98a]/40 bg-[#101010] px-6 py-5 shadow-lg">
      <div className="relative">
        {/* ribbon "Limited items" */}
        <div className="absolute left-0 top-0 z-10 rounded-br-3xl rounded-tl-3xl bg-[#101010] px-4 py-2 text-sm font-semibold text-white">
          Limited items
        </div>

        {/* khung trắng bên trong */}
        <div className="flex min-h-[180px] flex-col items-center justify-between rounded-3xl bg-[#f3f3f3] py-7">
          {/* nội dung trung tâm: text + image (backend update) */}
          <div className="flex items-center justify-between gap-6">
            <span className="text-3xl font-semibold text-black">
              {current.name}
            </span>
            <div
              className="relative h-28 w-40"
              style={{
                background: `url(${current.imageUrl}) center/contain no-repeat`,
              }}
            ></div>
          </div>

          {/* slider dots */}
          <div className="flex items-center justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === index ? "1rem" : "0.5rem", // w-3 vs w-2
                  backgroundColor:
                    i === index ? "#f6d98a" : "rgba(255,255,255,0.6)",
                    padding: "5px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
