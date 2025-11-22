/**
 * Componente: SecuritySettings
 * 
 * Sección de configuración de seguridad para el perfil del usuario.
 * Permite:
 * - Activar 2FA: genera secreto TOTP, muestra QR y clave manual
 * - Desactivar 2FA: requiere confirmación con contraseña
 * - Regenerar secreto 2FA: invalidando el anterior
 * 
 * Este componente debe integrarse en una página de perfil/ajustes del usuario.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, ShieldCheck, ShieldOff, RefreshCw, Loader2, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

const SecuritySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Estado para activar 2FA
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyingSetup, setVerifyingSetup] = useState(false);
  
  // Estado para desactivar 2FA
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
    }
  }, [user]);

  // Cargar estado actual de 2FA del usuario
  const loadSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error cargando configuración de seguridad:', error);
      } else {
        setTwoFactorEnabled(data?.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ACTIVAR 2FA: Generar secreto y QR usando Edge Function
  const handleStartSetup = async () => {
    try {
      // Llamar a la Edge Function para generar el secreto en el backend
      const { data: { session } } = await supabase.auth.getSession();
      
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-2fa-secret`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error generando secreto 2FA');
      }

      const { secret: secretBase32, qrCodeData } = await response.json();
      
      setSecret(secretBase32);

      // Generar código QR para escanear con Google Authenticator
      const qrCode = await QRCode.toDataURL(qrCodeData);
      setQrCodeUrl(qrCode);

      setShowSetupDialog(true);

    } catch (error) {
      console.error('Error generando secreto 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el código 2FA",
      });
    }
  };

  // Verificar código y guardar el secreto en BD
  const handleVerifySetup = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código incompleto",
        description: "Introduce el código de 6 dígitos",
      });
      return;
    }

    setVerifyingSetup(true);

    try {
      // VERIFICAR el código TOTP usando Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      
      const verifyResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/verify-totp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user!.id,
            token: verificationCode,
            secret: secret, // Pasamos el secreto temporal para verificar antes de guardar
          }),
        }
      );

      if (!verifyResponse.ok) {
        throw new Error('Error verificando código');
      }

      const { valid } = await verifyResponse.json();

      if (!valid) {
        toast({
          variant: "destructive",
          title: "Código incorrecto",
          description: "El código no es válido. Verifica que esté sincronizado con la app.",
        });
        setVerifyingSetup(false);
        return;
      }

      // Guardar el secreto en la BD
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
        })
        .eq('id', user!.id);

      if (error) {
        console.error('Error guardando 2FA:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo activar la verificación en dos pasos",
        });
        setVerifyingSetup(false);
        return;
      }

      console.log('✅ 2FA activado correctamente');
      
      toast({
        title: "2FA activado",
        description: "La verificación en dos pasos está ahora activa",
      });

      setTwoFactorEnabled(true);
      setShowSetupDialog(false);
      setVerificationCode("");

    } catch (error) {
      console.error('Error verificando 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al verificar el código",
      });
    } finally {
      setVerifyingSetup(false);
    }
  };

  // DESACTIVAR 2FA: Requiere contraseña actual
  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast({
        variant: "destructive",
        title: "Contraseña requerida",
        description: "Introduce tu contraseña actual para desactivar 2FA",
      });
      return;
    }

    setDisabling(true);

    try {
      // Verificar la contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: disablePassword,
      });

      if (signInError) {
        toast({
          variant: "destructive",
          title: "Contraseña incorrecta",
          description: "La contraseña no es correcta",
        });
        setDisabling(false);
        return;
      }

      // Desactivar 2FA en la BD
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null, // Eliminar secreto por seguridad
        })
        .eq('id', user!.id);

      if (error) {
        console.error('Error desactivando 2FA:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo desactivar 2FA",
        });
        setDisabling(false);
        return;
      }

      console.log('✅ 2FA desactivado');
      
      toast({
        title: "2FA desactivado",
        description: "La verificación en dos pasos ha sido desactivada",
      });

      setTwoFactorEnabled(false);
      setShowDisableDialog(false);
      setDisablePassword("");

    } catch (error) {
      console.error('Error desactivando 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error",
      });
    } finally {
      setDisabling(false);
    }
  };

  // Copiar clave secreta al portapapeles
  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copiado",
      description: "Clave secreta copiada al portapapeles",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <CardTitle>Seguridad de la cuenta</CardTitle>
        </div>
        <CardDescription>
          Gestiona la verificación en dos pasos (2FA) para proteger tu cuenta
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado actual de 2FA */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            {twoFactorEnabled ? (
              <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <ShieldOff className="w-5 h-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                Verificación en dos pasos (2FA)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {twoFactorEnabled
                  ? "Activa - Tu cuenta está protegida con 2FA"
                  : "Inactiva - Se recomienda activar 2FA para mayor seguridad"}
              </p>
              {twoFactorEnabled && (
                <div className="mt-2 flex gap-2">
                  <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Desactivar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Desactivar verificación en dos pasos</DialogTitle>
                        <DialogDescription>
                          Para desactivar 2FA, confirma tu identidad introduciendo tu contraseña actual.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Al desactivar 2FA, tu cuenta será menos segura.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label htmlFor="disable-password">Contraseña actual</Label>
                          <Input
                            id="disable-password"
                            type="password"
                            placeholder="••••••••"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            disabled={disabling}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDisableDialog(false);
                            setDisablePassword("");
                          }}
                          disabled={disabling}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDisable2FA}
                          disabled={disabling}
                        >
                          {disabling ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Desactivando...
                            </>
                          ) : (
                            "Desactivar 2FA"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={handleStartSetup}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar código
                  </Button>
                </div>
              )}
            </div>
          </div>

          {!twoFactorEnabled && (
            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleStartSetup}>
                  <Shield className="w-4 h-4 mr-2" />
                  Activar 2FA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurar verificación en dos pasos</DialogTitle>
                  <DialogDescription>
                    Escanea el código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Código QR */}
                  {qrCodeUrl && (
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border rounded-lg" />
                    </div>
                  )}

                  {/* Clave manual */}
                  <div className="space-y-2">
                    <Label>Clave secreta (si no puedes escanear el QR)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={secret}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopySecret}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Verificar código */}
                  <div className="space-y-2">
                    <Label>Introduce el código de 6 dígitos</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                        disabled={verifyingSetup}
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
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Guarda la clave secreta en un lugar seguro. La necesitarás si cambias de dispositivo.
                    </AlertDescription>
                  </Alert>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSetupDialog(false);
                      setVerificationCode("");
                    }}
                    disabled={verifyingSetup}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleVerifySetup}
                    disabled={verifyingSetup || verificationCode.length !== 6}
                  >
                    {verifyingSetup ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activar 2FA
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-muted p-4 rounded-lg border">
          <p className="text-sm font-medium mb-2">¿Qué es la verificación en dos pasos?</p>
          <p className="text-xs text-muted-foreground">
            La verificación en dos pasos (2FA) añade una capa extra de seguridad a tu cuenta. 
            Además de tu contraseña, necesitarás introducir un código de 6 dígitos generado 
            por una aplicación de autenticación en tu teléfono.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
