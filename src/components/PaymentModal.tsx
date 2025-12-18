import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CheckCircle, Loader2, QrCode } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  productName: string;
}

const PaymentModal = ({ isOpen, onClose, price, productName }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentCode: string;
    paymentCodeBase64: string;
    transactionId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !paymentData && !loading) {
      generatePayment();
    }
  }, [isOpen]);

  const generatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: price,
        },
      });

      console.log('Payment response:', data);

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      if (!data.paymentCode) {
        throw new Error('QR Code não gerado pela API');
      }

      setPaymentData({
        paymentCode: data.paymentCode,
        paymentCodeBase64: data.paymentCodeBase64,
        transactionId: data.transactionId,
      });
      toast.success('Pagamento PIX gerado!');
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Erro ao gerar pagamento');
      toast.error(error.message || 'Erro ao gerar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (paymentData?.paymentCode) {
      await navigator.clipboard.writeText(paymentData.paymentCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center">
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">{productName}</p>
            <p className="text-2xl font-bold text-primary">
              R$ {price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Gerando pagamento PIX...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-4">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={generatePayment} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {paymentData && !loading && (
            <>
              {/* QR Code */}
              {paymentData.paymentCodeBase64 && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={`data:image/png;base64,${paymentData.paymentCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* PIX Code */}
              <div className="space-y-2">
                <Label>Código PIX (Copia e Cola)</Label>
                <div className="relative">
                  <Input
                    value={paymentData.paymentCode}
                    readOnly
                    className="bg-muted/50 border-border pr-12 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={copyPixCode}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={copyPixCode}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código PIX
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Após o pagamento, seu acesso será liberado automaticamente.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
