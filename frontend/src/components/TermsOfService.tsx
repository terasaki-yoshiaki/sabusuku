import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TermsOfServiceProps {
  onAccept: () => void
}

export function TermsOfService({ onAccept }: TermsOfServiceProps) {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    if (!agreed) return
    
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/user/accept-terms`, {
        method: 'POST',
      })
      
      if (response.ok) {
        onAccept()
      }
    } catch (error) {
      console.error('Failed to accept terms:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">利用規約</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-96 w-full border rounded-md p-4">
            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-lg">サブスクリプション管理アプリ利用規約</h3>
              
              <section>
                <h4 className="font-semibold">第1条（適用）</h4>
                <p>本規約は、本アプリケーションの利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
              </section>

              <section>
                <h4 className="font-semibold">第2条（利用登録）</h4>
                <p>本サービスの利用にあたり、ユーザーは正確な情報を提供し、変更があった場合は速やかに更新するものとします。</p>
              </section>

              <section>
                <h4 className="font-semibold">第3条（データの取り扱い）</h4>
                <p>本アプリは、ユーザーが入力したサブスクリプション情報を管理目的でのみ使用します。第三者への提供は行いません。</p>
              </section>

              <section>
                <h4 className="font-semibold">第4条（免責事項）</h4>
                <p>本サービスの利用により生じた損害について、当方は一切の責任を負いません。ユーザーの責任において利用してください。</p>
              </section>

              <section>
                <h4 className="font-semibold">第5条（規約の変更）</h4>
                <p>本規約は予告なく変更される場合があります。変更後の規約は、本アプリ内での表示をもって効力を生じるものとします。</p>
              </section>

              <section>
                <h4 className="font-semibold">第6条（準拠法・管轄裁判所）</h4>
                <p>本規約は日本法に準拠し、本サービスに関する紛争については、東京地方裁判所を専属的合意管轄裁判所とします。</p>
              </section>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="agree" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label htmlFor="agree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              利用規約に同意します
            </label>
          </div>

          <Button 
            onClick={handleAccept}
            disabled={!agreed || loading}
            className="w-full"
          >
            {loading ? '処理中...' : '同意して開始'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
