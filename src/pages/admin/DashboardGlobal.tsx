import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, LogOut, Factory, Package, Users, BarChart3, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DashboardGlobal = () => {
  const { user, signOut, userRoles } = useAuth();
  const navigate = useNavigate();
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 via-background to-info/10">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary rounded-lg p-2">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">EcoZero</h1>
                <p className="text-xs text-muted-foreground hidden md:block">Sistema de Gestión Integral</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <p className="text-sm font-medium">{user?.email}</p>
              {userRoles.length > 0 && (
                <p className="text-xs text-muted-foreground capitalize">
                  {userRoles[0].role.replace(/_/g, " ")}
                </p>
              )}
              {/* Admin button - only visible to admin_global */}
              {userRoles.some((r) => r.role === "admin_global") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminDialog(true)}
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
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-success/5 to-success/10 border-success/20 cursor-pointer border-l-4 border-l-success"
            onClick={() => navigate("/dashboard/produccion")}>

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
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-info/5 to-info/10 border-info/20 cursor-pointer border-l-4 border-l-info opacity-50">
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
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20 cursor-pointer border-l-4 border-l-warning"
            onClick={() => navigate("/dashboard/rrhh")}>

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
              <Button 
                onClick={() => navigate("/dashboard/rrhh")}
                className="w-full status-warning hover:bg-warning/90 touch-target"
              >
                Acceder →
              </Button>
            </CardContent>
          </Card>

          {/* Dashboards Module */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 cursor-pointer border-l-4 border-l-secondary opacity-50">
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
        <Card className="mt-6 bg-gradient-to-r from-success/10 via-info/10 to-warning/10 border-success/20">
          <CardHeader>
            <CardTitle className="text-lg">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">✓</div>
                <p className="text-xs text-muted-foreground mt-1">Producción</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">✓</div>
                <p className="text-xs text-muted-foreground mt-1">RRHH</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">○</div>
                <p className="text-xs text-muted-foreground mt-1">Logística</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">○</div>
                <p className="text-xs text-muted-foreground mt-1">Dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Admin Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Panel de Administración</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                setShowAdminDialog(false);
                navigate('/admin/users');
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Gestión de Usuarios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardGlobal;
