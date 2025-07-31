"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronRight } from "lucide-react"

interface DateDropdownProps {
  onDateSelect: (date: string) => void
}

export function DateDropdown({ onDateSelect }: DateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const getDateString = (daysFromToday: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + daysFromToday)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  const dateOptions = [
    {
      label: "TODAY",
      value: "today",
      subtitle: today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    },
    { label: "TOMORROW", value: "tomorrow", subtitle: getDateString(1) },
    { label: "3RD DAY", value: "day3", subtitle: getDateString(2) },
    { label: "4TH DAY", value: "day4", subtitle: getDateString(3) },
    { label: "5TH DAY", value: "day5", subtitle: getDateString(4) },
  ]

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setShowCalendar(false)
    }, 500)
  }

  const handleDateSelect = (value: string) => {
    onDateSelect(value)
    setIsOpen(false)
    setShowCalendar(false)
  }

  const openCalendar = () => {
    setShowCalendar(true)
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

      <button className="p-3 hover:bg-gray-800 rounded-lg transition-all duration-200 relative z-40 group">
        <Calendar className="w-5 h-5 text-white transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12" />
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
            className="absolute top-full right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {!showCalendar ? (
              <div className="py-2">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateSelect(option.value)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-700 transition-all duration-200 flex flex-col"
                  >
                    <span className="text-white font-medium text-sm">{option.label}</span>
                    <span className="text-gray-400 text-xs mt-1">{option.subtitle}</span>
                  </button>
                ))}

                <div className="border-t border-gray-700 mt-1">
                  <button
                    onClick={openCalendar}
                    className="w-full px-6 py-4 text-left hover:bg-gray-700 transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">SELECT DAY</span>
                      <span className="text-gray-400 text-xs mt-1">Open calendar view</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Select Date</h3>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="text-gray-400 p-2 font-medium">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(today.getFullYear(), today.getMonth(), i - 6)
                    const isCurrentMonth = date.getMonth() === today.getMonth()
                    const isToday = date.toDateString() === today.toDateString()

                    return (
                      <button
                        key={i}
                        onClick={() => handleDateSelect(date.toISOString())}
                        className={`p-2 rounded-lg text-sm transition-all duration-200 hover:scale-110 ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : isCurrentMonth
                              ? "text-white hover:bg-gray-700"
                              : "text-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
