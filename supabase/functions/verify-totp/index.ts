/**
 * Supabase Edge Function: verify-totp
 * 
 * Verifica un código TOTP (Time-based One-Time Password) contra el secreto
 * almacenado del usuario. Compatible con Google Authenticator y apps similares.
 * 
 * Endpoint: POST /functions/v1/verify-totp
 * Body: { userId: string, token: string }
 * Response: { valid: boolean, error?: string }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as OTPAuth from "https://esm.sh/otpauth@9.1.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtener body de la petición
    const { userId, token, secret } = await req.json();

    if (!userId || !token) {
      return new Response(
        JSON.stringify({ valid: false, error: 'userId y token son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato del token (debe ser 6 dígitos)
    if (!/^\d{6}$/.test(token)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'El código debe ser de 6 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totpSecret: string;

    // Si se proporciona un secreto temporal (para setup), usarlo
    // Si no, buscar el secreto almacenado en la BD
    if (secret) {
      totpSecret = secret;
    } else {
      // Crear cliente Supabase con service_role key para acceso completo
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Obtener el secreto 2FA del usuario desde la BD
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('two_factor_enabled, two_factor_secret')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error obteniendo perfil:', profileError);
        return new Response(
          JSON.stringify({ valid: false, error: 'Error al verificar credenciales' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar que el usuario tenga 2FA habilitado
      if (!profile.two_factor_enabled || !profile.two_factor_secret) {
        return new Response(
          JSON.stringify({ valid: false, error: '2FA no está habilitado para este usuario' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      totpSecret = profile.two_factor_secret;
    }

    // VERIFICACIÓN TOTP: comparar el token recibido con el secreto
    // OTPAuth usa el algoritmo estándar TOTP (RFC 6238) compatible con Google Authenticator
    const totp = new OTPAuth.TOTP({
      secret: totpSecret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30, // Ventana de 30 segundos estándar
    });

    // Validar el token con una ventana de tolerancia de ±1 periodo (30 seg)
    // Esto permite cierta flexibilidad por desincronización de relojes
    const delta = totp.validate({ token, window: 1 });

    // delta === null significa token inválido
    // delta === número significa token válido (número indica cuántos periodos de diferencia)
    const isValid = delta !== null;

    console.log(`Verificación TOTP para usuario ${userId}: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);

    return new Response(
      JSON.stringify({ valid: isValid }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error en verify-totp:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
