'use client'

import { useRef, useState, useEffect, ChangeEvent, DragEvent } from 'react'
import ImgIcon from '@/public/market/ImgIcon'

interface AddItemProps {
    handleTurnOffAddItem: () => void
}

export default function AdminAddItemCard({ handleTurnOffAddItem }: AddItemProps) {
  const inputFileRef = useRef<HTMLInputElement | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [rarity, setRarity] = useState('')
  const [price, setPrice] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    const url = URL.createObjectURL(file)
    setImgPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  useEffect(() => {
    return () => {
      if (imgPreview) URL.revokeObjectURL(imgPreview)
    };
  }, [imgPreview])

  const handleAddItem = () => {
    if (!name || !rarity || !price || !imgPreview) {
      setShowErrors(true)
      return
    }

    setShowErrors(false)
  }

  const isFieldInvalid = (value: string | null) => showErrors && (!value || value.trim() === '')

  const baseInputClass =
    '!bg-[#C4C4C4] h-[5vh] text-[2.5vh] leading-[2.5vh] w-full !text-black !outline-none border border-transparent'
  const getInputClass = (value: string) => {
    const invalid = isFieldInvalid(value)
    return `${baseInputClass} ${
      invalid ? '!border-2 !border-[#EA2027] focus:!border-[#EA2027]' : ''
    }`
  }

  const showImgError = showErrors && !imgPreview

  return (
    <div className="absolute z-100 top-0 left-0 w-full h-full flex justify-center items-center">
      <div 
        className="bg-[rgba(255,255,255,0.1)] blur-[20px] absolute top-0 left-0 w-full h-full cursor-pointer"
        onClick={handleTurnOffAddItem}
    />
      <div className="bg-secondary-bg-color max-h-[80vh] w-[40vw] rounded-[2vw] flex items-center p-[3vw] z-200 flex-col gap-[3vw]">
        <div className="flex justify-between w-full gap-[2vw]">
          <div 
            className="flex justify-center items-center py-[1vh] px-[2vw] rounded-[1vh] font-bold border-2 border-white cursor-pointer flex-1 active:text-black active:bg-white transition-colors duration-200"
            onClick={handleTurnOffAddItem}
        >
            Cancel
          </div>
          <div
            className="flex justify-center items-center py-[1vh] px-[2vw] rounded-[1vh] font-bold border-2 border-white cursor-pointer text-black bg-[#E9B654] flex-1 active:bg-[#b28531] active:text-white transition-colors duration-200"
            onClick={handleAddItem}
          >
            Add Item
          </div>
        </div>

        <div className="bg-[#D9D9D9] w-full py-[3vh] px-[5vw] rounded-[2vw] flex flex-col items-center gap-[1.5vw]">
          <div className="flex flex-col items-center gap-[0.75vw] w-full">
            <p
              className={`text-[2vh] leading-[2vh] font-bold ${
                isFieldInvalid(name) ? 'text-[#EA2027]' : 'text-black'
              }`}
            >
              Item&apos;s name {isFieldInvalid(name) && <span>(required)</span>}
            </p>
            <input
              type="text"
              className={getInputClass(name)}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col items-center gap-[0.75vw] w-full">
            <p
              className={`text-[2vh] leading-[2vh] font-bold ${
                isFieldInvalid(rarity) ? 'text-[#EA2027]' : 'text-black'
              }`}
            >
              Item&apos;s rarity {isFieldInvalid(rarity) && <span>(required)</span>}
            </p>
            <input
              type="text"
              className={getInputClass(rarity)}
              value={rarity}
              onChange={e => setRarity(e.target.value)}
            />
          </div>

          <div className="flex flex-col items-center gap-[0.75vw] w-full">
            <p
              className={`text-[2vh] leading-[2vh] font-bold ${
                isFieldInvalid(price) ? 'text-[#EA2027]' : 'text-black'
              }`}
            >
              Item&apos;s price {isFieldInvalid(price) && <span>(required)</span>}
            </p>
            <input
              type="text"
              className={getInputClass(price)}
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col items-center gap-[0.75vw] w-full">
            <p
              className={`text-[2vh] leading-[2vh] font-bold ${
                showImgError ? 'text-[#EA2027]' : 'text-black'
              }`}
            >
              Item&apos;s image {showImgError && <span>(required)</span>}
            </p>

            <label
              htmlFor="img-drop"
              className={`w-full h-[15vh] bg-[#C4C4C4] group rounded-[1vw] cursor-pointer flex justify-center items-center overflow-hidden border border-transparent ${
                showImgError ? '!border-2 !border-[#EA2027]' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={inputFileRef}
                type="file"
                id="img-drop"
                hidden
                accept="image/*"
                onChange={handleInputChange}
              />

              <div
                className="w-full h-full bg-center bg-contain bg-no-repeat flex justify-center items-center"
                style={
                  imgPreview
                    ? {
                        backgroundImage: `url(${imgPreview})`,
                        border: 'none',
                      }
                    : {}
                }
              >
                {!imgPreview && (
                  <div className="h-[5vh] aspect-square bg-center bg-contain bg-no-repeat">
                    <ImgIcon />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
