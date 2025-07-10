import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

interface Payment {
  id: string
  service_name: string
  amount: number
  withdrawal_date: number
  is_override: boolean
}

interface SaveDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  selectedDate: string
  payments: Payment[]
  memoContent: string
}

export function SaveDialog({ isOpen, onClose, onSave, selectedDate, payments, memoContent }: SaveDialogProps) {
  const [saveScope, setSaveScope] = useState<string>('day_only')
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const parseChanges = () => {
    const changes: any[] = []
    const sections = memoContent.split('\n\n').filter(section => section.trim())
    
    sections.forEach((section, index) => {
      if (payments[index]) {
        const lines = section.split('\n')
        const serviceNameMatch = lines[0]?.match(/【(.+)】/)
        const withdrawalDateMatch = lines[1]?.match(/引き落とし日: (\d+)日/)
        const amountMatch = lines[2]?.match(/金額: ¥(\d+(?:\.\d+)?)/)
        
        const originalPayment = payments[index]
        const newServiceName = serviceNameMatch?.[1] || originalPayment.service_name
        const newWithdrawalDate = withdrawalDateMatch ? parseInt(withdrawalDateMatch[1]) : originalPayment.withdrawal_date
        const newAmount = amountMatch ? parseFloat(amountMatch[1]) : originalPayment.amount
        
        if (newServiceName !== originalPayment.service_name ||
            newWithdrawalDate !== originalPayment.withdrawal_date ||
            newAmount !== originalPayment.amount) {
          changes.push({
            serviceId: originalPayment.id,
            serviceName: newServiceName,
            withdrawalDate: newWithdrawalDate,
            amount: newAmount
          })
        }
      }
    })
    
    return changes
  }

  const generateMonthOptions = () => {
    const months: { value: string; label: string }[] = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentDate.getMonth() + i, 1)
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const displayName = `${date.getFullYear()}年${date.getMonth() + 1}月`
      months.push({ value: yearMonth, label: displayName })
    }
    
    return months
  }

  const handleMonthToggle = (monthValue: string, checked: boolean) => {
    if (checked) {
      setSelectedMonths(prev => [...prev, monthValue])
    } else {
      setSelectedMonths(prev => prev.filter(m => m !== monthValue))
    }
  }

  const handleSave = async () => {
    const changes = parseChanges()
    if (changes.length === 0) {
      onSave()
      return
    }

    setLoading(true)
    try {
      for (const change of changes) {
        const payload = {
          service_id: change.serviceId,
          date: selectedDate,
          service_name: change.serviceName,
          amount: change.amount,
          withdrawal_date: change.withdrawalDate,
          scope: saveScope,
          months: saveScope === 'manual_months' ? selectedMonths : undefined
        }

        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/payments/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }
      
      onSave()
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthOptions = generateMonthOptions()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>変更を保存</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={saveScope} onValueChange={setSaveScope}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="day_only" id="day_only" />
              <Label htmlFor="day_only">この日のみ変更する</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all_service" id="all_service" />
              <Label htmlFor="all_service">同じサービスの全ての引き落とし内容に反映させる</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual_months" id="manual_months" />
              <Label htmlFor="manual_months">反映させる月を手動で設定する</Label>
            </div>
          </RadioGroup>

          {saveScope === 'manual_months' && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-3 block">反映する月を選択してください</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {monthOptions.map((month) => (
                    <div key={month.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={month.value}
                        checked={selectedMonths.includes(month.value)}
                        onCheckedChange={(checked) => handleMonthToggle(month.value, checked as boolean)}
                      />
                      <Label htmlFor={month.value} className="text-sm">
                        {month.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              キャンセル
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || (saveScope === 'manual_months' && selectedMonths.length === 0)}
              className="flex-1"
            >
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
