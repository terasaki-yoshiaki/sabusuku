import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TermsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsDialog({ isOpen, onClose }: TermsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>利用規約</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96 w-full pr-4">
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
      </DialogContent>
    </Dialog>
  )
}
