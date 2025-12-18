import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create the admin user
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'pedrintips@gmail.com',
      password: 'gustavo45@@',
      email_confirm: true
    })

    if (createError) {
      // If user already exists, that's fine
      if (createError.message.includes('already been registered')) {
        return new Response(JSON.stringify({ message: 'User already exists' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }
      throw createError
    }

    // Add admin role
    if (user?.user) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: user.user.id, role: 'admin' }, { onConflict: 'user_id' })
      
      if (roleError) console.error('Role error:', roleError)
    }

    return new Response(JSON.stringify({ success: true, userId: user?.user?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
