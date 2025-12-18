import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('SYNCPAYMENTS_CLIENT_ID');
    const clientSecret = Deno.env.get('SYNCPAYMENTS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Payment service not configured');
    }

    const { amount }: PaymentRequest = await req.json();

    if (amount < 1) {
      throw new Error('Valor mínimo é R$ 1,00');
    }

    // Step 1: Get access token
    const authResponse = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!authResponse.ok) {
      throw new Error('Falha na autenticação');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Step 2: Create PIX payment
    const paymentResponse = await fetch('https://api.syncpayments.com.br/v1/gateway/api', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: '127.0.0.1',
        pix: {
          expiresInDays: '2025-12-31'
        },
        items: [{
          title: 'Acesso VIP - Conteúdo Exclusivo',
          quantity: 1,
          tangible: true,
          unitPrice: amount
        }],
        amount: amount,
        customer: {
          cpf: '12345678901',
          name: 'Cliente',
          email: 'cliente@email.com',
          phone: '11999999999',
          externaRef: 'REF' + Date.now(),
          address: {
            city: 'São Paulo',
            state: 'SP',
            street: 'Rua Principal',
            country: 'BR',
            zipCode: '01000-000',
            complement: '',
            neighborhood: 'Centro',
            streetNumber: '1'
          }
        },
        metadata: {
          provider: 'ClubSystem',
          sell_url: 'https://club.example.com',
          order_url: 'https://club.example.com/order',
          user_email: 'cliente@email.com'
        },
        traceable: true,
        postbackUrl: 'https://club.example.com/webhook'
      }),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Payment failed:', errorText);
      throw new Error('Falha ao criar pagamento');
    }

    const paymentData = await paymentResponse.json();

    if (!paymentData.paymentCode) {
      throw new Error('Código PIX não gerado');
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentCode: paymentData.paymentCode,
        paymentCodeBase64: paymentData.paymentCodeBase64,
        transactionId: paymentData.idTransaction,
        status: paymentData.status_transaction,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
