-- FASE 0: FUNDACIÓN - EcoCero MVP
-- Sistema de roles de 3 niveles + Tablas core de Producción

-- 1. ENUM para roles
CREATE TYPE public.app_role AS ENUM ('admin_global', 'admin_departamento', 'supervisor', 'operario', 'quality');

-- 2. ENUM para departamentos
CREATE TYPE public.departamento AS ENUM ('produccion', 'logistica', 'compras', 'rrhh', 'comercial', 'administrativo');

-- 3. ENUM para estados
CREATE TYPE public.of_status AS ENUM ('pendiente', 'en_proceso', 'completada', 'validada', 'albarana');
CREATE TYPE public.step_status AS ENUM ('pendiente', 'en_proceso', 'completado', 'error');
CREATE TYPE public.line_status AS ENUM ('active', 'paused', 'error');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');

-- 4. Tabla de perfiles (sincronizada con auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  departamento departamento,
  line_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla de roles (separada por seguridad)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- 6. Líneas de producción
CREATE TABLE public.production_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 8,
  status line_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Órdenes de Fabricación
CREATE TABLE public.fabrication_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sap_id TEXT UNIQUE,
  customer TEXT NOT NULL,
  line_id UUID REFERENCES public.production_lines(id),
  status of_status NOT NULL DEFAULT 'pendiente',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  supervisor_id UUID REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Pasos de producción
CREATE TABLE public.production_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  of_id UUID NOT NULL REFERENCES public.fabrication_orders(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status step_status NOT NULL DEFAULT 'pendiente',
  data_json JSONB DEFAULT '{}'::jsonb,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(of_id, step_number)
);

-- 9. Alertas
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  related_of_id UUID REFERENCES public.fabrication_orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- 10. Log de actividad (auditoría)
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrication_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Función de seguridad para verificar si es admin (global o departamento)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin_global', 'admin_departamento')
  )
$$;

-- RLS POLICIES

-- Profiles: todos ven todos, solo admins editan
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

-- User roles: solo admins pueden ver/modificar
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles" 
  ON public.user_roles FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles" 
  ON public.user_roles FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Production lines: todos ven, solo admins editan
CREATE POLICY "Lines are viewable by authenticated users" 
  ON public.production_lines FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage lines" 
  ON public.production_lines FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Fabrication orders: todos ven, supervisores y admins editan
CREATE POLICY "OFs are viewable by authenticated users" 
  ON public.fabrication_orders FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can insert OFs" 
  ON public.fabrication_orders FOR INSERT 
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Admins and supervisors can update OFs" 
  ON public.fabrication_orders FOR UPDATE 
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- Production steps: todos ven, operarios editan los suyos, supervisores todos
CREATE POLICY "Steps are viewable by authenticated users" 
  ON public.production_steps FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Operarios can update their assigned steps" 
  ON public.production_steps FOR UPDATE 
  USING (
    assigned_to = auth.uid() OR 
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Supervisors can insert steps" 
  ON public.production_steps FOR INSERT 
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- Alerts: todos ven, todos pueden crear
CREATE POLICY "Alerts are viewable by authenticated users" 
  ON public.alerts FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create alerts" 
  ON public.alerts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can resolve alerts" 
  ON public.alerts FOR UPDATE 
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- Activity log: solo lectura para admins
CREATE POLICY "Admins can view activity log" 
  ON public.activity_log FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert activity log" 
  ON public.activity_log FOR INSERT 
  WITH CHECK (true);

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_lines_updated_at
  BEFORE UPDATE ON public.production_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fabrication_orders_updated_at
  BEFORE UPDATE ON public.fabrication_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar líneas de producción iniciales
INSERT INTO public.production_lines (name, capacity, status) VALUES
  ('ECONORDIK', 8, 'active'),
  ('QUADRILATERAL', 8, 'active');

-- Enable realtime para actualizaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.fabrication_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_lines;