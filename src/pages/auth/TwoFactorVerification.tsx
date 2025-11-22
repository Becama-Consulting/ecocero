/**
 * Componente: TwoFactorVerification
 * 
 * Pantalla intermedia que aparece DESPUÉS de validar email + contraseña,
 * solo si el usuario tiene 2FA habilitado.
 * 
 * Solicita el código TOTP de 6 dígitos generado por Google Authenticator u otra app TOTP.
 * Si el código es correcto, completa el login y redirige según el rol.
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TwoFactorVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Estado de ubicación debe contener: { userId: string, email: string }
  // Este estado viene del flujo de login en Auth.tsx
  const { userId, email } = location.state || {};
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirigir a login si no hay userId (acceso directo sin pasar por login)
  useEffect(() => {
    if (!userId || !email) {
      console.log('⚠️ Acceso directo a 2FA sin userId, redirigiendo a login');
      navigate("/auth", { replace: true });
    }
  }, [userId, email, navigate]);

  // Validar código cuando se completen los 6 dígitos
  useEffect(() => {
    if (code.length === 6) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código incompleto",
        description: "El código debe tener 6 dígitos",
      });
      return;
    }

    setLoading(true);

    try {
      // Llamar a la Edge Function que verifica el TOTP
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { userId, token: code },
      });

      if (error) {
        console.error('Error llamando verify-totp:', error);
        toast({
          variant: "destructive",
          title: "Error de verificación",
          description: "No se pudo verificar el código. Intenta nuevamente.",
        });
        setCode("");
        setLoading(false);
        return;
      }

      // Verificar si el código es válido
      if (data.valid) {
        console.log('✅ Código 2FA válido, completando login...');
        
        toast({
          title: "Verificación exitosa",
          description: "Accediendo a tu cuenta...",
        });

        // Marcar que el login está completo
        sessionStorage.setItem('hasRedirected', 'true');

        // Obtener roles del usuario para redirigir correctamente
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        // Redirigir según el rol (misma lógica que en Auth.tsx)
        if (roles?.some(r => r.role === 'admin_global')) {
          navigate('/admin/dashboard', { replace: true });
        } else if (roles?.some(r => r.role === 'supervisor')) {
          navigate('/dashboard/produccion/supervisor', { replace: true });
        } else {
          navigate('/dashboard/produccion', { replace: true });
        }

      } else {
        // Código inválido
        console.log('❌ Código 2FA inválido');
        toast({
          variant: "destructive",
          title: "Código incorrecto",
          description: "El código de verificación es incorrecto. Intenta nuevamente.",
        });
        setCode("");
        setLoading(false);
      }

    } catch (error) {
      console.error('Error verificando 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al verificar el código.",
      });
      setCode("");
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Volver al login (debe cerrar la sesión parcial si existe)
    sessionStorage.removeItem('hasRedirected');
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/10 via-background to-info/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 rounded-full p-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verificación en dos pasos</CardTitle>
          <CardDescription className="text-base">
            Introduce el código de 6 dígitos generado por tu aplicación de autenticación
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email del usuario */}
          <div className="text-center text-sm text-muted-foreground">
            Verificando sesión para:<br />
            <span className="font-medium text-foreground">{email}</span>
          </div>

          {/* Input OTP */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Indicador de carga */}
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando código...</span>
            </div>
          )}

          {/* Ayuda */}
          <div className="bg-muted p-4 rounded-lg border border-border space-y-2">
            <p className="text-sm font-medium">¿No puedes acceder a tu código?</p>
            <p className="text-xs text-muted-foreground">
              Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.) 
              y busca la cuenta de <strong>EcoCero</strong> para ver el código actual.
            </p>
          </div>

          {/* Botón volver */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleBack}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorVerification;
