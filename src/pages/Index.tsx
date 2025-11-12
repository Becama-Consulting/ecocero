import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, LogOut, Factory, Package, Users, BarChart3, Settings } from "lucide-react";

const Index = () => {
  const { user, signOut, userRoles, isAdmin, getDashboardByRole, loading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const handleRedirect = async () => {
      // Evitar múltiples redirects
      if (hasRedirected.current) return;
      
      console.log('🔍 Index.tsx - Checking redirect:', {
        loading,
        user: user?.email,
        userRoles,
        isAdmin: isAdmin()
      });

      if (!loading && user && !isAdmin()) {
        hasRedirected.current = true;
        const dashboardRoute = await getDashboardByRole();
        console.log('🚀 Redirecting to:', dashboardRoute);
        
        if (dashboardRoute !== '/') {
          navigate(dashboardRoute, { replace: true });
        }
      } else if (!loading && user && isAdmin()) {
        console.log('✅ Admin detected - staying on Index page (selector)');
      }
    };

    handleRedirect();
  }, [loading, user, userRoles, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 via-background to-info/10">
      {/* Header with Logo and User Info */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary rounded-full p-2">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">EcoCero</h1>
              <p className="text-xs text-muted-foreground">Automatización Integral</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              {userRoles.length > 0 && (
                <p className="text-xs text-muted-foreground capitalize">
                  {userRoles[0].role.replace(/_/g, " ")}
                </p>
              )}
            </div>
            {/* Admin button - only visible to admin_global */}
            {userRoles.some((r) => r.role === "admin_global") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/global")}
                className="touch-target"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="touch-target"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Bienvenido al Sistema
          </h2>
          <p className="text-muted-foreground">
            Selecciona un módulo para comenzar
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Producción Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-success">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="status-success rounded-lg p-2">
                  <Factory className="w-6 h-6" />
                </div>
                <CardTitle>Producción</CardTitle>
              </div>
              <CardDescription>
                Dashboard en tiempo real, naves digitales, registro de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/dashboard/produccion")}
                className="w-full status-success hover:bg-success/90 touch-target"
              >
                Acceder →
              </Button>
            </CardContent>
          </Card>

          {/* Logística Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-info opacity-50">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="status-info rounded-lg p-2">
                  <Package className="w-6 h-6" />
                </div>
                <CardTitle>Logística</CardTitle>
              </div>
              <CardDescription>
                Optimización de envíos, seguimiento, validación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* RRHH Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-warning opacity-50">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="status-warning rounded-lg p-2">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle>RRHH</CardTitle>
              </div>
              <CardDescription>
                Fichajes, turnos, nóminas, gestión de personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Dashboards Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-secondary opacity-50">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-2">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <CardTitle>Dashboards</CardTitle>
              </div>
              <CardDescription>
                Métricas ejecutivas, KPIs, análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Card */}
        <Card className="mt-6 bg-success-light border-success">
          <CardHeader>
            <CardTitle className="text-success">✓ Sistema Activo</CardTitle>
            <CardDescription>
              Lovable Cloud habilitado • Autenticación configurada • Base de datos lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">2</p>
                <p className="text-xs text-muted-foreground">Líneas de Producción</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">0</p>
                <p className="text-xs text-muted-foreground">OFs Activas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">1</p>
                <p className="text-xs text-muted-foreground">Usuario Activo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">MVP</p>
                <p className="text-xs text-muted-foreground">Fase 0 Completada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
