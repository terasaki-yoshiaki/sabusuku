import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  currentYear: number
  currentMonth: number
  onMonthChange: (year: number, month: number) => void
}

export function Calendar({ selectedDate, onDateSelect, currentYear, currentMonth, onMonthChange }: CalendarProps) {
  const [paymentDates, setPaymentDates] = useState<number[]>([])

  useEffect(() => {
    fetchCalendarData()
  }, [currentYear, currentMonth])

  const fetchCalendarData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/calendar/${currentYear}/${currentMonth}`)
      const data = await response.json()
      setPaymentDates(data.payment_dates || [])
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(currentYear - 1, 12)
    } else {
      onMonthChange(currentYear, currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(currentYear + 1, 1)
    } else {
      onMonthChange(currentYear, currentMonth + 1)
    }
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    onDateSelect(dateStr)
  }

  const isPaymentDate = (day: number) => {
    return paymentDates.includes(day)
  }

  const isSelectedDate = (day: number) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return selectedDate === dateStr
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  const calendarDays: (number | null)[] = []
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {currentYear}年 {monthNames[currentMonth - 1]}
        </h3>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((dayName) => (
          <div key={dayName} className="p-2 text-center text-sm font-medium text-gray-600">
            {dayName}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => handleDateClick(day)}
                className={`
                  w-full h-full flex items-center justify-center text-sm rounded-md transition-colors
                  ${isSelectedDate(day) 
                    ? 'bg-blue-500 text-white' 
                    : isPaymentDate(day)
                    ? 'bg-red-100 text-red-800 font-semibold hover:bg-red-200'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded border"></div>
          <span>支払日</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>選択中</span>
        </div>
      </div>
    </div>
  )
}
