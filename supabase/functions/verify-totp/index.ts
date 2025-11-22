/**
 * Supabase Edge Function: verify-totp
 * 
 * Verifica códigos TOTP (Time-based One-Time Password) de 6 dígitos.
 * Implementa RFC 6238 con ventana de tolerancia de ±30 segundos.
 * 
 * Uso:
 * - POST /functions/v1/verify-totp
 *   Body: { code: string, secret?: string, userId?: string }
 *   Response: { valid: boolean }
 * 
 * Si se proporciona 'secret', valida contra ese secreto (para setup).
 * Si se proporciona 'userId', busca el secreto en la BD (para login).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Decodifica un secreto Base32 a bytes
 */
function base32Decode(base32: string): Uint8Array {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const base32Clean = base32.toUpperCase().replace(/=+$/, '');
  
  let bits = '';
  for (const char of base32Clean) {
    const val = base32Chars.indexOf(char);
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  
  return bytes;
}

/**
 * Genera HMAC-SHA1
 */
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}

/**
 * Genera un código TOTP para un timestamp específico
 */
async function generateTOTP(secret: string, timeStep: number = 30, time?: number): Promise<string> {
  const epoch = Math.floor((time || Date.now()) / 1000);
  const counter = Math.floor(epoch / timeStep);
  
  // Convertir counter a 8 bytes
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter >> 8;
  }
  
  // Decodificar secreto
  const secretBytes = base32Decode(secret);
  
  // Generar HMAC
  const hmac = await hmacSha1(secretBytes, counterBytes);
  
  // Truncamiento dinámico (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

/**
 * Verifica un código TOTP con ventana de tolerancia
 */
async function verifyTOTP(code: string, secret: string, window: number = 1): Promise<boolean> {
  const now = Date.now();
  const timeStep = 30000; // 30 segundos en ms
  
  // Verificar código actual y ventanas adyacentes
  for (let i = -window; i <= window; i++) {
    const testTime = now + (i * timeStep);
    const expectedCode = await generateTOTP(secret, 30, testTime);
    
    if (code === expectedCode) {
      return true;
    }
  }
  
  return false;
}

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { code, secret, userId } = body;

    // Validaciones
    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Código requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato del código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Código debe ser 6 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let secretToVerify = secret;

    // Si no se proporciona secret, buscar en BD usando userId
    if (!secretToVerify && userId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('two_factor_secret')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.two_factor_secret) {
        return new Response(
          JSON.stringify({ valid: false, error: '2FA no configurado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      secretToVerify = profile.two_factor_secret;
    }

    // Validar que tengamos un secreto
    if (!secretToVerify) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Secret o userId requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar código TOTP
    const valid = await verifyTOTP(code, secretToVerify, 1); // Ventana de ±30s

    console.log(`${valid ? '✅' : '❌'} Verificación TOTP para ${userId || 'setup'}: ${valid ? 'VÁLIDO' : 'INVÁLIDO'}`);

    return new Response(
      JSON.stringify({ valid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en verify-totp:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
