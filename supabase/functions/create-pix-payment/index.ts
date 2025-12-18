import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('SYNCPAYMENTS_CLIENT_ID');
    const clientSecret = Deno.env.get('SYNCPAYMENTS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('Missing SyncPayments credentials');
      throw new Error('Payment service not configured');
    }

    const { amount }: PaymentRequest = await req.json();

    // Validate minimum amount
    if (amount < 1) {
      throw new Error('Valor mínimo é R$ 1,00');
    }

    console.log('Authenticating with SyncPayments...');

    // Step 1: Get access token
    const authResponse = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Auth failed:', errorText);
      throw new Error('Falha na autenticação com gateway de pagamento');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    console.log('Authentication successful, creating payment...');

    // Step 2: Create PIX payment
    const paymentBody = {
      ip: '127.0.0.1',
      pix: {
        expiresInDays: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      items: [
        {
          title: 'Acesso VIP - Conteúdo Exclusivo',
          quantity: 1,
          tangible: false,
          unitPrice: amount,
        },
      ],
      amount: amount,
      customer: {
        cpf: '00000000000',
        name: 'Cliente',
        email: 'cliente@email.com',
        phone: '11999999999',
        externaRef: `club_${Date.now()}`,
        address: {
          city: 'São Paulo',
          state: 'SP',
          street: 'Rua Principal',
          country: 'BR',
          zipCode: '01000-000',
          complement: '',
          neighborhood: 'Centro',
          streetNumber: '1',
        },
      },
      metadata: {
        provider: 'ClubSystem',
      },
      traceable: true,
    };

    console.log('Payment request body:', JSON.stringify(paymentBody));

    const paymentResponse = await fetch('https://api.syncpayments.com.br/v1/gateway/api', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentBody),
    });

    const paymentText = await paymentResponse.text();
    console.log('Payment response:', paymentText);

    if (!paymentResponse.ok) {
      console.error('Payment creation failed:', paymentText);
      throw new Error('Falha ao criar pagamento PIX');
    }

    const paymentData = JSON.parse(paymentText);

    console.log('Payment data parsed:', JSON.stringify(paymentData));

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
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
