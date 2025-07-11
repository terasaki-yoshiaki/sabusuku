import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from './Calendar'
import { SaveDialog } from './SaveDialog'
import { Menu, Save } from 'lucide-react'
import { TermsDialog } from './TermsDialog'

interface Payment {
  id: string
  service_name: string
  amount: number
  withdrawal_date: number
  is_override: boolean
}

export function MainScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [memoContent, setMemoContent] = useState<string>('')
  const [originalMemoContent, setOriginalMemoContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)

  useEffect(() => {
    if (selectedDate) {
      fetchPaymentsForDate(selectedDate)
    }
  }, [selectedDate])

  const fetchPaymentsForDate = async (date: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/payments/${date}`)
      const paymentsData = await response.json()
      setPayments(paymentsData)
      
      const content = paymentsData.map((payment: Payment) => 
        `【${payment.service_name}】\n引き落とし日: ${payment.withdrawal_date}日\n金額: ¥${payment.amount}`
      ).join('\n\n')
      
      setMemoContent(content)
      setOriginalMemoContent(content)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

  const handleMemoChange = (value: string) => {
    setMemoContent(value)
    setIsEditing(value !== originalMemoContent)
  }

  const handleSave = () => {
    if (payments.length > 0) {
      setShowSaveDialog(true)
    }
  }

  const handleSaveComplete = () => {
    setShowSaveDialog(false)
    setIsEditing(false)
    setOriginalMemoContent(memoContent)
    setCalendarRefreshKey(prev => prev + 1)
    if (selectedDate) {
      fetchPaymentsForDate(selectedDate)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">サブスク管理</h1>
          <div className="flex gap-2">
            {isEditing && (
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTermsDialog(true)}
            >
              <Menu className="w-4 h-4 mr-2" />
              規約
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Memo Area */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-medium">メモ欄</h2>
                {selectedDate && (
                  <span className="text-sm text-gray-600">{selectedDate}</span>
                )}
              </div>
              <Textarea
                value={memoContent}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder={selectedDate ? "カレンダーの日付をタップして支払い内容を表示" : "カレンダーの日付を選択してください"}
                className="min-h-32 resize-none"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentYear={currentYear}
              currentMonth={currentMonth}
              onMonthChange={(year, month) => {
                setCurrentYear(year)
                setCurrentMonth(month)
              }}
              refreshKey={calendarRefreshKey}
            />
          </CardContent>
        </Card>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <SaveDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={handleSaveComplete}
          selectedDate={selectedDate}
          payments={payments}
          memoContent={memoContent}
        />
      )}

      {/* Terms Dialog */}
      {showTermsDialog && (
        <TermsDialog
          isOpen={showTermsDialog}
          onClose={() => setShowTermsDialog(false)}
        />
      )}
    </div>
  )
}
