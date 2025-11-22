/**
 * Componente: ForgotPassword
 * 
 * Pantalla donde el usuario solicita un enlace de recuperación de contraseña.
 * El usuario introduce su email y recibe un enlace (si el email existe).
 * 
 * Por seguridad, NO se revela si el email existe o no en la base de datos.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor introduce tu dirección de email",
      });
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor introduce un email válido",
      });
      return;
    }

    setLoading(true);

    try {
      // Llamar a la Edge Function para solicitar reset de contraseña
      const { data, error } = await supabase.functions.invoke('password-reset', {
        body: { 
          action: 'request',
          email: email.trim() 
        },
      });

      if (error) {
        console.error('Error solicitando reset:', error);
        throw new Error('Error solicitando reset');
      }

      console.log('✅ Solicitud de reset enviada para:', email);
      
      // Mostrar mensaje de éxito (genérico por seguridad)
      setSuccess(true);
      
      toast({
        title: "Solicitud enviada",
        description: data?.message || "Revisa tu correo electrónico",
      });

    } catch (error) {
      console.error('Error en forgot password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/auth");
  };

  // Vista de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/10 via-background to-info/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Revisa tu correo</CardTitle>
            <CardDescription className="text-base">
              Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                El enlace de recuperación expirará en <strong>1 hora</strong>.
                Si no recibes el correo, revisa tu carpeta de spam.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg border border-border space-y-2">
              <p className="text-sm font-medium">Email enviado a:</p>
              <p className="text-sm text-muted-foreground break-all">{email}</p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulario de solicitud
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/10 via-background to-info/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 rounded-full p-3">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription className="text-base">
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full status-success hover:bg-success/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar enlace de recuperación
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleBack}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>

          {/* Información de seguridad */}
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Nota de seguridad:</strong> Por razones de seguridad, 
              recibirás el mismo mensaje tanto si el email existe como si no. 
              Esto previene que terceros descubran qué emails están registrados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
