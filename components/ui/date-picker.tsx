"use client"

import * as React from "react"
import { format, addDays, addWeeks, startOfDay } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, Zap, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "📅 納期を選択...",
  className
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const quickDateOptions = [
    {
      label: "📋 今日",
      icon: <Clock className="h-3 w-3" />,
      date: startOfDay(new Date()),
      color: "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
    },
    {
      label: "🌅 明日", 
      icon: <Zap className="h-3 w-3" />,
      date: startOfDay(addDays(new Date(), 1)),
      color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
    },
    {
      label: "📝 来週",
      icon: <CalendarIcon className="h-3 w-3" />,
      date: startOfDay(addWeeks(new Date(), 1)),
      color: "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
    }
  ]

  const handleQuickSelect = (selectedDate: Date) => {
    onDateChange?.(selectedDate)
    setIsOpen(false)
  }

  const handleClearDate = () => {
    onDateChange?.(undefined)
    setIsOpen(false)
  }

  const formatSelectedDate = (selectedDate: Date) => {
    const today = startOfDay(new Date())
    const tomorrow = startOfDay(addDays(new Date(), 1))
    
    if (selectedDate.getTime() === today.getTime()) {
      return "📋 今日"
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      return "🌅 明日"
    } else {
      return format(selectedDate, "yyyy年MM月dd日", { locale: ja })
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-12 text-base rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
            !date && "text-muted-foreground",
            date && "bg-gradient-to-r from-green-50 to-blue-50 border-green-300",
            className
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5 text-green-600" />
          {date ? (
            <span className="font-medium text-gray-800">
              {formatSelectedDate(date)}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-2 border-gray-200">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              📅 納期を設定
            </h3>
            {date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDate}
                className="h-7 w-7 p-0 hover:bg-red-100 rounded-lg"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {quickDateOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(option.date)}
                className={cn(
                  "justify-start gap-2 h-10 font-medium border-2 rounded-xl transition-all duration-200 hover:scale-105",
                  option.color
                )}
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-b-2xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange?.(selectedDate)
              setIsOpen(false)
            }}
            initialFocus
            locale={ja}
            className="rounded-b-2xl"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}