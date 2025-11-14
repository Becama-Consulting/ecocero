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
        JSON.stringify({ error: 'No tienes permisos para eliminar usuarios. Se requiere rol admin_global.' }),
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

    // Prevent self-deletion
    if (userId === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: 'No puedes eliminar tu propio usuario' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting user:', userId);

    // Get user info before deletion for logging
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    // Step 1: Delete user roles (foreign key dependency)
    const { error: rolesDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesDeleteError) {
      console.error('Error deleting user roles:', rolesDeleteError.message);
      return new Response(
        JSON.stringify({ 
          error: `Error al eliminar roles del usuario: ${rolesDeleteError.message}`,
          details: rolesDeleteError.details
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ User roles deleted');

    // Step 2: Delete profile (foreign key to auth.users)
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError.message);
      return new Response(
        JSON.stringify({ 
          error: `Error al eliminar perfil del usuario: ${profileDeleteError.message}`,
          details: profileDeleteError.details
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ User profile deleted');

    // Step 3: Delete from auth.users (requires service role)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError.message);
      return new Response(
        JSON.stringify({ 
          error: `Error al eliminar usuario del sistema de autenticación: ${authDeleteError.message}`,
          details: authDeleteError.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ Auth user deleted');

    // Log activity
    const { error: logError } = await supabaseAdmin.from('activity_log').insert({
      user_id: requestingUser.id,
      action: 'delete_user',
      table_name: 'profiles',
      record_id: userId,
      old_values: userProfile
    });

    if (logError) {
      console.warn('Failed to log activity (non-critical):', logError.message);
    }

    console.log('✓✓✓ User deletion completed successfully ✓✓✓');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario eliminado exitosamente',
        deletedUser: {
          id: userId,
          email: userProfile?.email,
          name: userProfile?.name
        }
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
        error: 'Error inesperado al eliminar usuario',
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: error?.constructor?.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
