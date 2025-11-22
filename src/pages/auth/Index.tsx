import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, userRoles, loading } = useAuth();
  const [dashboardPath, setDashboardPath] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!loading && user) {
      // Si hay roles, calcular dashboard inmediatamente
      if (userRoles.length > 0) {
        // Admin global
        if (userRoles.some(r => r.role === 'admin_global')) {
          if (isMounted) setDashboardPath('/admin/dashboard');
          return;
        }
        
        // Otros roles van a producción por ahora
        if (isMounted) setDashboardPath('/dashboard/produccion');
      } else {
        // Si no hay roles después de 2 segundos, redirigir a producción
        const timeout = setTimeout(() => {
          if (isMounted) setDashboardPath('/dashboard/produccion');
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [loading, user, userRoles]);

  // Mostrar loader mientras carga la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/10 via-background to-info/10">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Esperar a que el dashboard esté calculado
  if (!dashboardPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/10 via-background to-info/10">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Redirigir al dashboard correspondiente
  return <Navigate to={dashboardPath} replace />;
};

export default Index;
