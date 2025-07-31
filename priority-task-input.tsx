"use client"

import type React from "react"

import { useState } from "react"
import { Plus, ArrowUp } from "lucide-react"
import Image from "next/image"
import { DateDropdown } from "./components/date-dropdown"
import { ColorPicker } from "./components/color-picker"

export default function PriorityTaskInput() {
  const [isPriorityOn, setIsPriorityOn] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("#3B82F6")
  const [taskText, setTaskText] = useState<string>("What's important today?")

  const formatDateOverlay = (dateValue: string) => {
    if (!dateValue) return ""

    let date: Date

    // Handle different date formats
    if (dateValue === "today") {
      date = new Date()
    } else if (dateValue === "tomorrow") {
      date = new Date()
      date.setDate(date.getDate() + 1)
    } else if (dateValue.startsWith("day")) {
      const dayNumber = Number.parseInt(dateValue.replace("day", ""))
      date = new Date()
      date.setDate(date.getDate() + dayNumber - 1)
    } else {
      date = new Date(dateValue)
    }

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    return `${day}/${month}`
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    console.log("Selected date:", date)
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    console.log("Selected color:", color)
  }

  const handleTaskTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskText(e.target.value)
  }

  const handleTaskTextFocus = () => {
    if (taskText === "What's important today?") {
      setTaskText("")
    }
  }

  const handleTaskTextBlur = () => {
    if (taskText.trim() === "") {
      setTaskText("What's important today?")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 font-inter">
      {/* Glowing Border Container */}
      <div
        className="relative rounded-3xl"
        style={{
          padding: "2px",
          background: `linear-gradient(145deg, ${selectedColor || "#3B82F6"}, transparent, ${selectedColor || "#3B82F6"})`,
          boxShadow: `0 0 20px ${selectedColor || "#3B82F6"}40, 0 0 40px ${selectedColor || "#3B82F6"}20, inset 0 0 20px ${selectedColor || "#3B82F6"}10`,
        }}
      >
        {/* Static content container */}
        <div className="relative bg-gray-900 rounded-2xl border border-gray-700 p-4">
          <div className="flex items-center gap-4">
            {/* Plus Icon */}
            <button className="group">
              <Plus className="w-6 h-6 text-white transition-all duration-200 group-hover:scale-110 group-hover:rotate-90" />
            </button>

            {/* Main Input Text Field */}
            <div className="flex-1">
              <input
                type="text"
                value={taskText}
                onChange={handleTaskTextChange}
                onFocus={handleTaskTextFocus}
                onBlur={handleTaskTextBlur}
                className={`w-full bg-transparent text-white text-lg font-medium placeholder-gray-400 border-none outline-none transition-all duration-200 focus:text-white ${
                  taskText === "What's important today?" ? "text-gray-300" : "text-white"
                }`}
                placeholder="What's important today?"
              />
            </div>

            {/* Priority Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-medium">Priority</span>
              <button
                onClick={() => setIsPriorityOn(!isPriorityOn)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 hover:scale-105 ${
                  isPriorityOn ? "bg-blue-600" : "bg-red-600"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 flex items-center justify-center ${
                    isPriorityOn ? "translate-x-7" : "translate-x-1"
                  }`}
                >
                  {isPriorityOn ? (
                    <Image
                      src="/icons/turtle-black.svg"
                      alt="Turtle"
                      width={16}
                      height={16}
                      className="w-4 h-4 brightness-0 transition-transform duration-200"
                      style={{ filter: "brightness(0)" }}
                    />
                  ) : (
                    <Image
                      src="/icons/warning-new.svg"
                      alt="Warning"
                      width={13}
                      height={11}
                      className="w-3 h-3 brightness-0 transition-transform duration-200 animate-pulse"
                      style={{ filter: "brightness(0)" }}
                    />
                  )}
                </span>
              </button>
            </div>

            {/* Date Dropdown with Overlay */}
            <div className="relative">
              <DateDropdown onDateSelect={handleDateSelect} />
              {selectedDate && (
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 px-1.5 py-0.5 z-50 pointer-events-none"
                  style={{ borderRadius: "3px" }}
                >
                  <span className="text-white text-xs font-medium">{formatDateOverlay(selectedDate)}</span>
                </div>
              )}
            </div>

            {/* Color Picker */}
            <ColorPicker onColorSelect={handleColorSelect} selectedColor={selectedColor} />

            {/* Up Arrow Button */}
            <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl transition-all duration-200 group hover:scale-105">
              <ArrowUp className="w-5 h-5 text-white transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
