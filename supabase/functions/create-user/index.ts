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
      console.error('Error fetching roles:', rolesError.message, rolesError.details);
      return new Response(
        JSON.stringify({ error: 'Error al verificar permisos del usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Requesting user roles:', requestingUserRoles);

    // Get requesting user's department
    const { data: requestingUserProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('departamento')
      .eq('id', requestingUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
    }

    const isAdminGlobal = requestingUserRoles?.some(r => r.role === 'admin_global');
    const isAdminDepartamento = requestingUserRoles?.some(r => r.role === 'admin_departamento');
    const isSupervisor = requestingUserRoles?.some(r => r.role === 'supervisor');

    if (!isAdminGlobal && !isAdminDepartamento && !isSupervisor) {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para crear usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let email, password, name, departamento, role;
    
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
      name = body.name;
      departamento = body.departamento;
      role = body.role;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Formato de datos inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!email || !password || !name || !role) {
      console.error('Missing required fields:', { email: !!email, password: !!password, name: !!name, role: !!role });
      return new Response(
        JSON.stringify({ 
          error: 'Faltan campos requeridos',
          missing: {
            email: !email,
            password: !password,
            name: !name,
            role: !role
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate role is valid
    const validRoles = ['admin_global', 'admin_departamento', 'supervisor', 'operario', 'quality'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Rol inválido. Debe ser uno de: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify permissions based on role hierarchy
    if (isSupervisor && !isAdminGlobal && !isAdminDepartamento) {
      // Supervisors can only create operarios in their department
      if (role !== 'operario') {
        return new Response(
          JSON.stringify({ error: 'Los supervisores solo pueden crear operarios' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (departamento !== requestingUserProfile?.departamento) {
        return new Response(
          JSON.stringify({ error: 'Solo puedes crear usuarios en tu departamento' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (isAdminDepartamento && !isAdminGlobal) {
      // Admin departamento can create in their department but not other admins
      if (departamento !== requestingUserProfile?.departamento) {
        return new Response(
          JSON.stringify({ error: 'Solo puedes crear usuarios en tu departamento' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (role === 'admin_global' || role === 'admin_departamento') {
        return new Response(
          JSON.stringify({ error: 'No puedes crear otros administradores' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if email already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError.message);
      return new Response(
        JSON.stringify({ error: 'Error al verificar email existente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      console.warn('Email already exists:', email);
      return new Response(
        JSON.stringify({ error: 'Este email ya está registrado en el sistema' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating user with data:', { email, name, departamento, role });

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name }
    });

    if (createError) {
      console.error('Error creating auth user:', {
        message: createError.message,
        status: createError.status,
        name: createError.name
      });
      return new Response(
        JSON.stringify({ 
          error: `Error al crear usuario en el sistema de autenticación: ${createError.message}`,
          details: createError.status 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser?.user) {
      console.error('User creation succeeded but no user object returned');
      return new Response(
        JSON.stringify({ error: 'Error inesperado: usuario no retornado por el sistema' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = newUser.user.id;
    console.log('✓ Auth user created successfully:', userId);

    // Create profile (using service role to bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        name,
        departamento: departamento || null
      });

    if (profileError) {
      console.error('Error creating profile:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
      
      // Rollback: delete the auth user
      console.log('Rolling back: deleting auth user', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ 
          error: `Error al crear perfil de usuario: ${profileError.message}`,
          details: profileError.details
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ Profile created successfully for user:', userId);

    // Assign role (using service role to bypass RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });

    if (roleError) {
      console.error('Error assigning role:', {
        message: roleError.message,
        details: roleError.details,
        hint: roleError.hint,
        code: roleError.code
      });
      
      // Rollback: delete profile and auth user
      console.log('Rolling back: deleting profile and auth user', userId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ 
          error: `Error al asignar rol: ${roleError.message}`,
          details: roleError.details
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ Role assigned successfully to user:', userId, '-', role);

    // Log activity
    const { error: logError } = await supabaseAdmin.from('activity_log').insert({
      user_id: requestingUser.id,
      action: 'create_user',
      table_name: 'profiles',
      record_id: userId,
      new_values: { email, name, departamento, role }
    });

    if (logError) {
      console.warn('Failed to log activity (non-critical):', logError.message);
    }

    console.log('✓✓✓ User creation completed successfully ✓✓✓');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          name,
          departamento: departamento || null,
          role
        },
        message: 'Usuario creado exitosamente'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Type:', error?.constructor?.name);
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: 'Error inesperado al crear usuario',
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: error?.constructor?.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
