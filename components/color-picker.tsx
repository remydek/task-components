"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

interface ColorPickerProps {
  onColorSelect: (color: string) => void
  selectedColor?: string
}

export function ColorPicker({ onColorSelect, selectedColor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showFullPicker, setShowFullPicker] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const predefinedColors = [
    { name: "Red", value: "#EF4444", bg: "bg-red-500" },
    { name: "Orange", value: "#F97316", bg: "bg-orange-500" },
    { name: "Yellow", value: "#EAB308", bg: "bg-yellow-500" },
    { name: "Green", value: "#22C55E", bg: "bg-green-500" },
    { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
    { name: "Purple", value: "#A855F7", bg: "bg-purple-500" },
    { name: "Pink", value: "#EC4899", bg: "bg-pink-500" },
    { name: "Gray", value: "#6B7280", bg: "bg-gray-500" },
  ]

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    // Don't close if full picker is open
    if (showFullPicker) return

    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setShowFullPicker(false)
    }, 500)
  }

  const handleColorSelect = (color: string) => {
    onColorSelect(color)
  }

  const openFullPicker = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowFullPicker(true)
    // Clear any pending close timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const closeFullPicker = () => {
    setShowFullPicker(false)
  }

  const closeDropdown = () => {
    setIsOpen(false)
    setShowFullPicker(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      {/* Extended hover area */}
      <div className="absolute -inset-2 z-30" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />

      <button className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 relative z-40 group">
        <Image
          src="/icons/dropper.svg"
          alt="Dropper"
          width={20}
          height={20}
          className="w-5 h-5 transition-all duration-200 group-hover:scale-110 group-hover:rotate-12"
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-gray-600 transition-all duration-300 group-hover:scale-125"
          style={{ backgroundColor: selectedColor || "#EAB308" }}
        ></div>
      </button>

      {isOpen && (
        <>
          {/* Large invisible bridge */}
          <div
            className="absolute top-full right-0 w-72 h-4 z-40"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          <div
            className="absolute top-full right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={showFullPicker ? undefined : handleMouseLeave}
          >
            {!showFullPicker ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium text-sm">Choose Color</h3>
                  <button onClick={closeDropdown} className="text-gray-400 hover:text-white text-lg transition-colors">
                    ×
                  </button>
                </div>

                {/* Color Grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorSelect(color.value)}
                      className={`w-12 h-12 rounded-lg ${color.bg} hover:scale-110 transition-all duration-200 relative group`}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
                      )}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Full Color Picker Option */}
                <div className="border-t border-gray-700 pt-3">
                  <button
                    onClick={openFullPicker}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-all duration-200 flex items-center gap-3 rounded-lg group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 transition-transform duration-200 group-hover:scale-110"></div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">Custom Color</span>
                      <span className="text-gray-400 text-xs">Open color picker</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="p-4 animate-in slide-in-from-left-2 duration-200"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => {}} // Prevent closing when in full picker
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Custom Color</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={closeFullPicker}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={closeDropdown}
                      className="text-gray-400 hover:text-white text-lg transition-colors hover:rotate-90 duration-200"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* HTML5 Color Picker */}
                  <div>
                    <label className="block text-white text-sm mb-2">Pick a color:</label>
                    <input
                      type="color"
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-full h-12 rounded-lg border border-gray-600 bg-gray-700 cursor-pointer transition-transform hover:scale-105 duration-200"
                      defaultValue={selectedColor || "#3B82F6"}
                    />
                  </div>

                  {/* Hex Input */}
                  <div>
                    <label className="block text-white text-sm mb-2">Or enter hex code:</label>
                    <input
                      type="text"
                      placeholder="#3B82F6"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all duration-200 focus:scale-105"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = (e.target as HTMLInputElement).value
                          if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                            handleColorSelect(value)
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Recent Colors */}
                  <div>
                    <label className="block text-white text-sm mb-2">Recent colors:</label>
                    <div className="flex gap-2">
                      {predefinedColors.slice(0, 4).map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorSelect(color.value)}
                          className={`w-8 h-8 rounded ${color.bg} hover:scale-110 transition-all duration-200`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
