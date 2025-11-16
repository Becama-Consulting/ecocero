import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { docEntry } = await req.json();

    if (!docEntry) {
      throw new Error('docEntry is required');
    }

    // 1. Login a SAP
    const loginResponse = await fetch(`${Deno.env.get('SAP_BASE_URL')}/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CompanyDB: Deno.env.get('SAP_COMPANY_DB'),
        UserName: Deno.env.get('SAP_USERNAME'),
        Password: Deno.env.get('SAP_PASSWORD'),
      }),
    });

    const session = await loginResponse.json();
    const sessionId = session.SessionId;

    // 2. Obtener orden de SAP
    const orderResponse = await fetch(
      `${Deno.env.get('SAP_BASE_URL')}/ProductionOrders(${docEntry})`,
      {
        headers: {
          'Cookie': `B1SESSION=${sessionId}`,
        },
      }
    );

    const sapOrder = await orderResponse.json();

    // 3. Crear cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Upsert en Supabase
    const { data, error } = await supabase
      .from('fabrication_orders')
      .upsert({
        sap_id: sapOrder.DocEntry.toString(),
        customer: sapOrder.CardName || 'N/A',
        status: sapOrder.ProductionOrderStatus === 'P' ? 'pendiente' :
                sapOrder.ProductionOrderStatus === 'R' ? 'en_proceso' :
                sapOrder.ProductionOrderStatus === 'C' ? 'completada' : 'pendiente',
        priority: sapOrder.Priority || 0,
        created_at: sapOrder.PostingDate,
      }, {
        onConflict: 'sap_id'
      })
      .select()
      .single();

    if (error) throw error;

    // 5. Logout de SAP
    await fetch(`${Deno.env.get('SAP_BASE_URL')}/Logout`, {
      method: 'POST',
      headers: {
        'Cookie': `B1SESSION=${sessionId}`,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
