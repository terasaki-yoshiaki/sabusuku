import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface Service {
  service_name: string
  withdrawal_date: number
  amount: number
}

interface InitialSetupProps {
  onComplete: () => void
}

export function InitialSetup({ onComplete }: InitialSetupProps) {
  const [services, setServices] = useState<Service[]>([])
  const [currentService, setCurrentService] = useState<Service>({
    service_name: '',
    withdrawal_date: 1,
    amount: 0
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: keyof Service, value: string | number) => {
    setCurrentService(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isCurrentServiceValid = () => {
    return currentService.service_name.trim() !== '' && 
           currentService.amount > 0 && 
           currentService.withdrawal_date >= 1 && 
           currentService.withdrawal_date <= 31
  }

  const handleNextService = async () => {
    if (!isCurrentServiceValid()) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentService),
      })

      if (response.ok) {
        const newServices = [...services]
        newServices[currentIndex] = currentService
        setServices(newServices)
        
        setCurrentIndex(currentIndex + 1)
        setCurrentService({
          service_name: '',
          withdrawal_date: 1,
          amount: 0
        })
      }
    } catch (error) {
      console.error('Failed to save service:', error)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentService(services[prevIndex] || {
        service_name: '',
        withdrawal_date: 1,
        amount: 0
      })
    }
  }

  const handleComplete = async () => {
    if (!isCurrentServiceValid()) return

    setLoading(true)
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentService),
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/user/complete-setup`, {
        method: 'POST',
      })

      if (response.ok) {
        onComplete()
      }
    } catch (error) {
      console.error('Failed to complete setup:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            支払い管理の初期設定
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            サービス {currentIndex + 1} の情報を入力してください
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_name">サービス名</Label>
            <Input
              id="service_name"
              value={currentService.service_name}
              onChange={(e) => handleInputChange('service_name', e.target.value)}
              placeholder="例: Netflix, Spotify"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawal_date">引き落とし日</Label>
            <Input
              id="withdrawal_date"
              type="number"
              min="1"
              max="31"
              value={currentService.withdrawal_date}
              onChange={(e) => handleInputChange('withdrawal_date', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">引き落とし金額（円）</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={currentService.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="例: 1980"
            />
          </div>

          <div className="flex gap-2 pt-4">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                前の内容を修正する
              </Button>
            )}
            
            <Button
              onClick={handleNextService}
              disabled={!isCurrentServiceValid()}
              className="flex-1"
            >
              次のサービスを入力
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Button
            onClick={handleComplete}
            disabled={!isCurrentServiceValid() || loading}
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? '処理中...' : '入力完了'}
          </Button>

          {services.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm font-medium mb-2">登録済みサービス:</p>
              <ul className="text-sm space-y-1">
                {services.map((service, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{service.service_name}</span>
                    <span>{service.withdrawal_date}日 - ¥{service.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
