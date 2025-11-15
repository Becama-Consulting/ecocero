-- =============================================
-- MIGRACIÓN: Tablas módulo RRHH
-- =============================================

-- TABLA: employees (empleados)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  hire_date DATE NOT NULL,
  termination_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: attendance (fichajes)
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: absences (ausencias)
CREATE TABLE public.absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pendiente',
  reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: shifts (turnos)
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  shift_type TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLA: employee_documents (documentos de empleados)
CREATE TABLE public.employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  required BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES para mejorar rendimiento
CREATE INDEX idx_attendance_employee_date ON public.attendance(employee_id, date);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_absences_employee_dates ON public.absences(employee_id, start_date, end_date);
CREATE INDEX idx_shifts_employee_date ON public.shifts(employee_id, date);
CREATE INDEX idx_employee_documents_employee ON public.employee_documents(employee_id);
CREATE INDEX idx_employees_active ON public.employees(active);

-- RLS (Row Level Security)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS: employees
CREATE POLICY "Authenticated users can view employees"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage employees"
  ON public.employees FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- POLÍTICAS RLS: attendance
CREATE POLICY "Authenticated users can view attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage attendance"
  ON public.attendance FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- POLÍTICAS RLS: absences
CREATE POLICY "Authenticated users can view absences"
  ON public.absences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage absences"
  ON public.absences FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- POLÍTICAS RLS: shifts
CREATE POLICY "Authenticated users can view shifts"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage shifts"
  ON public.shifts FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- POLÍTICAS RLS: employee_documents
CREATE POLICY "Authenticated users can view documents"
  ON public.employee_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage documents"
  ON public.employee_documents FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- TRIGGERS para updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_absences_updated_at
  BEFORE UPDATE ON public.absences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_documents_updated_at
  BEFORE UPDATE ON public.employee_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();