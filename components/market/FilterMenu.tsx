"use client"

import { useEffect, useRef, useState } from "react"

type FilterMenuProps = {
  options: string[]
  onClose: () => void
}

export default function FilterMenu({ options, onClose }: FilterMenuProps) {
  const [currentIndex, setCurrentIndex] = useState<null | number>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="bg-[#423D3D] p-[1vw] rounded-[1vw] flex flex-col min-w-[10vw] absolute left-[calc(100%+1vw)] top-0 z-[100]"
    >
      {options.map((content, index) =>
        currentIndex === index ? (
          <div
            key={index}
            onClick={() => setCurrentIndex(null)}
            className="min-w-full text-ts p-[1vh] text-primary-yellow-1 font-bold cursor-pointer"
          >
            {content}
          </div>
        ) : (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="min-w-full text-ts p-[1vh] text-white hover:bg-black rounded-[0.75rem] font-bold cursor-pointer transition-colors duration-200"
          >
            {content}
          </div>
        )
      )}
    </div>
  )
}
