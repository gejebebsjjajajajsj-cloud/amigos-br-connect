import { useState } from 'react';
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
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentCode: string;
    paymentCodeBase64: string;
    transactionId: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.cpf || !formData.phone) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      toast.error('CPF inválido');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: price,
          customerName: formData.name,
          customerEmail: formData.email,
          customerCpf: formData.cpf,
          customerPhone: formData.phone,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setPaymentData({
        paymentCode: data.paymentCode,
        paymentCodeBase64: data.paymentCodeBase64,
        transactionId: data.transactionId,
      });
      setStep('payment');
      toast.success('Pagamento PIX gerado!');
    } catch (error: any) {
      console.error('Payment error:', error);
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
    setStep('form');
    setPaymentData(null);
    setFormData({ name: '', email: '', cpf: '', phone: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center">
            {step === 'form' ? 'Dados para Pagamento' : 'Pagamento PIX'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">{productName}</p>
              <p className="text-2xl font-bold text-primary">
                R$ {price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                maxLength={15}
                className="bg-muted/50 border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Gerar Pagamento PIX
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Valor a pagar</p>
              <p className="text-2xl font-bold text-primary">
                R$ {price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* QR Code */}
            {paymentData?.paymentCodeBase64 && (
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
                  value={paymentData?.paymentCode || ''}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
