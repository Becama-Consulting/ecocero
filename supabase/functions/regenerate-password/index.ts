import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const authHeader = req.headers.get('Authorization');

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Configuración del servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'No autorizado - token faltante' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create regular client for auth verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the requesting user is authenticated
    const { data: { user: requestingUser }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !requestingUser) {
      console.error('Auth verification failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'No autorizado - sesión inválida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', requestingUser.id, requestingUser.email);

    // Get requesting user's roles using service role to bypass RLS
    const { data: requestingUserRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError.message);
      return new Response(
        JSON.stringify({ error: 'Error al verificar permisos del usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Requesting user roles:', requestingUserRoles);

    const isAdminGlobal = requestingUserRoles?.some(r => r.role === 'admin_global');

    if (!isAdminGlobal) {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para regenerar contraseñas. Se requiere rol admin_global.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let userId;
    
    try {
      const body = await req.json();
      userId = body.userId;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Formato de datos inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Regenerating password for user:', userId);

    // Get user info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('User not found:', profileError?.message);
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure random password (12 chars: uppercase, lowercase, numbers, symbols)
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '@#$%&*';
    const allChars = uppercaseChars + lowercaseChars + numberChars + symbolChars;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += symbolChars[Math.floor(Math.random() * symbolChars.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    console.log('New password generated (length:', password.length, ')');

    // Update user password using service role
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password }
    );

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return new Response(
        JSON.stringify({ 
          error: `Error al actualizar contraseña: ${updateError.message}`,
          details: updateError.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ Password updated successfully');

    // Log activity
    const { error: logError } = await supabaseAdmin.from('activity_log').insert({
      user_id: requestingUser.id,
      action: 'regenerate_password',
      table_name: 'auth.users',
      record_id: userId,
      new_values: { email: userProfile.email, name: userProfile.name }
    });

    if (logError) {
      console.warn('Failed to log activity (non-critical):', logError.message);
    }

    console.log('✓✓✓ Password regeneration completed successfully ✓✓✓');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contraseña regenerada exitosamente',
        user: {
          id: userId,
          email: userProfile.email,
          name: userProfile.name
        },
        password: password
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Type:', error?.constructor?.name);
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error inesperado al regenerar contraseña',
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: error?.constructor?.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
