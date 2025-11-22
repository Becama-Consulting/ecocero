import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  console.log('🛡️ ProtectedRoute check:', { loading, hasUser: !!user, allowedRoles });

  useEffect(() => {
    if (!loading && user && allowedRoles && allowedRoles.length > 0) {
      const hasPermission = allowedRoles.some(role => hasRole(role as any));
      
      if (!hasPermission) {
        console.log('❌ Sin permisos, redirigiendo a producción');
        toast.error('No tienes permisos para acceder a esta sección');
        navigate('/dashboard/produccion');
      }
    }
  }, [user, loading, allowedRoles, hasRole, navigate]);

  if (loading) {
    console.log('⏳ ProtectedRoute: Auth cargando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => hasRole(role as any));
    if (!hasPermission) {
      console.log('⛔ ProtectedRoute: Sin permisos necesarios');
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;