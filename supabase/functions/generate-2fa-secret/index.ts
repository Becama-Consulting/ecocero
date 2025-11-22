/**
 * Supabase Edge Function: generate-2fa-secret
 * 
 * Genera un secreto TOTP único para configurar autenticación de dos factores.
 * El secreto se genera server-side por seguridad y se devuelve junto con el URL otpauth
 * para generar códigos QR en el cliente.
 * 
 * Uso:
 * - POST /functions/v1/generate-2fa-secret
 *   Body: { userId: string, email: string }
 *   Response: { secret: string, otpauthUrl: string }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Caracteres válidos para Base32
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Genera un secreto aleatorio en formato Base32 (compatible con TOTP)
 */
function generateBase32Secret(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[array[i] % 32];
  }
  
  return secret;
}

/**
 * Genera la URL otpauth para códigos QR
 */
function generateOtpauthUrl(email: string, secret: string): string {
  const issuer = 'EcoCero';
  const account = email;
  
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, email } = body;

    // Validaciones
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'userId y email son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar secreto único
    const secret = generateBase32Secret(32);
    const otpauthUrl = generateOtpauthUrl(email, secret);

    console.log(`✅ Secreto 2FA generado para usuario ${userId}`);

    return new Response(
      JSON.stringify({
        secret,
        otpauthUrl,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en generate-2fa-secret:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
