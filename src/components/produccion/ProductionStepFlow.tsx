import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Circle, Lock, Clock, Camera, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Material {
  id: string;
  material_codigo: string;
  material_descripcion: string;
  cantidad_base: number;
  cantidad_total: number;
  cantidad_recibida: number;
  estado: string;
}

interface ProductionStepData {
  id: string;
  step_number: number;
  step_name: string;
  step_code: string; // CNC_GEN, MONT_GEN, PACKLOGIS
  status: 'pendiente' | 'en_proceso' | 'validacion_pendiente' | 'completado' | 'bloqueado';
  materials: Material[];
  started_at: string | null;
  completed_at: string | null;
  validated_at: string | null;
  validated_by: string | null;
  assigned_to: string | null;
  photos: string[];
  observations: string | null;
}

interface ProductionStepFlowProps {
  ofId: string;
  steps: ProductionStepData[];
  currentUser: any;
  onStepUpdate: () => void;
}

export const ProductionStepFlow = ({ ofId, steps, currentUser, onStepUpdate }: ProductionStepFlowProps) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const canStartStep = (step: ProductionStepData, stepIndex: number): boolean => {
    // El primer paso siempre se puede iniciar si está pendiente
    if (stepIndex === 0) {
      return step.status === 'pendiente';
    }

    // Los pasos siguientes solo se pueden iniciar si el anterior está completado
    const previousStep = steps[stepIndex - 1];
    return previousStep?.status === 'completado' && step.status === 'pendiente';
  };

  const canCompleteStep = (step: ProductionStepData): boolean => {
    // Solo se puede completar si está en proceso
    return step.status === 'en_proceso';
  };

  const canValidateStep = (step: ProductionStepData): boolean => {
    // Solo se puede validar si está en validación pendiente
    return step.status === 'validacion_pendiente';
  };

  const getStepIcon = (step: ProductionStepData, stepIndex: number) => {
    switch (step.status) {
      case 'completado':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'en_proceso':
        return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
      case 'validacion_pendiente':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case 'bloqueado':
        return <Lock className="h-6 w-6 text-gray-400" />;
      default:
        return canStartStep(step, stepIndex) ? (
          <Circle className="h-6 w-6 text-gray-400" />
        ) : (
          <Lock className="h-6 w-6 text-gray-300" />
        );
    }
  };

  const getStepBadge = (status: string) => {
    const badges = {
      pendiente: { label: 'Pendiente', variant: 'outline' as const },
      en_proceso: { label: 'En Proceso', variant: 'default' as const },
      validacion_pendiente: { label: 'Validación Pendiente', variant: 'secondary' as const },
      completado: { label: 'Completado', variant: 'default' as const },
      bloqueado: { label: 'Bloqueado', variant: 'outline' as const }
    };
    const badge = badges[status as keyof typeof badges] || badges.pendiente;
    return <Badge variant={badge.variant} className={status === 'completado' ? 'bg-green-600' : ''}>{badge.label}</Badge>;
  };

  const handleStartStep = async (step: ProductionStepData) => {
    try {
      const { error } = await supabase
        .from('production_steps')
        .update({
          status: 'en_proceso',
          started_at: new Date().toISOString(),
          assigned_to: currentUser?.id
        })
        .eq('id', step.id);

      if (error) throw error;

      toast.success(`Paso "${step.step_name}" iniciado`);
      onStepUpdate();
    } catch (error) {
      console.error('Error starting step:', error);
      toast.error('Error al iniciar el paso');
    }
  };

  const handleRequestValidation = async (step: ProductionStepData) => {
    try {
      const { error } = await supabase
        .from('production_steps')
        .update({
          status: 'validacion_pendiente'
        })
        .eq('id', step.id);

      if (error) throw error;

      toast.success(`Paso "${step.step_name}" enviado a validación`);
      onStepUpdate();
    } catch (error) {
      console.error('Error requesting validation:', error);
      toast.error('Error al solicitar validación');
    }
  };

  const handleValidateStep = async (step: ProductionStepData, approved: boolean) => {
    try {
      if (approved) {
        const { error } = await supabase
          .from('production_steps')
          .update({
            status: 'completado',
            completed_at: new Date().toISOString(),
            validated_at: new Date().toISOString(),
            validated_by: currentUser?.id
          })
          .eq('id', step.id);

        if (error) throw error;
        toast.success(`Paso "${step.step_name}" validado y completado`);
      } else {
        // Rechazar y devolver a en_proceso
        const { error } = await supabase
          .from('production_steps')
          .update({
            status: 'en_proceso'
          })
          .eq('id', step.id);

        if (error) throw error;
        toast.warning(`Paso "${step.step_name}" rechazado, debe revisarse`);
      }

      onStepUpdate();
    } catch (error) {
      console.error('Error validating step:', error);
      toast.error('Error al validar el paso');
    }
  };

  const calculateStepProgress = () => {
    const completedSteps = steps.filter(s => s.status === 'completado').length;
    return steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  };

  return (
    <div className="space-y-4">
      {/* Progreso General */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso de Fabricación</span>
              <span className="font-semibold">{Math.round(calculateStepProgress())}%</span>
            </div>
            <Progress value={calculateStepProgress()} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{steps.filter(s => s.status === 'completado').length} de {steps.length} pasos completados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pasos de Producción */}
      {steps.map((step, index) => (
        <Card 
          key={step.id}
          className={`
            ${step.status === 'en_proceso' ? 'border-blue-500 border-2' : ''}
            ${step.status === 'completado' ? 'border-green-500' : ''}
            ${step.status === 'validacion_pendiente' ? 'border-orange-500 border-2' : ''}
          `}
        >
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => setExpandedStep(expandedStep === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStepIcon(step, index)}
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <span>Paso {step.step_number}: {step.step_name}</span>
                    {getStepBadge(step.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{step.step_code}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {step.started_at && (
                  <p>Inicio: {new Date(step.started_at).toLocaleString('es-ES')}</p>
                )}
                {step.completed_at && (
                  <p>Completado: {new Date(step.completed_at).toLocaleString('es-ES')}</p>
                )}
              </div>
            </div>
          </CardHeader>

          {expandedStep === index && (
            <CardContent>
              <Separator className="mb-4" />

              {/* Materiales del Paso */}
              {step.materials && step.materials.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Materiales Requeridos</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cant. Base</TableHead>
                        <TableHead className="text-right">Total a Emitir</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {step.materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-mono">{material.material_codigo}</TableCell>
                          <TableCell>{material.material_descripcion}</TableCell>
                          <TableCell className="text-right">{material.cantidad_base.toFixed(3)}</TableCell>
                          <TableCell className="text-right font-semibold">{material.cantidad_total.toFixed(3)}</TableCell>
                          <TableCell>
                            <Badge variant={material.estado === 'disponible' ? 'default' : 'outline'}>
                              {material.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Fotos del Paso */}
              {step.photos && step.photos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Fotos del Proceso ({step.photos.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {step.photos.map((photo, idx) => (
                      <img 
                        key={idx} 
                        src={photo} 
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {step.observations && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Observaciones</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {step.observations}
                  </p>
                </div>
              )}

              {/* Acciones según el estado */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                {step.status === 'pendiente' && canStartStep(step, index) && (
                  <Button onClick={() => handleStartStep(step)}>
                    Iniciar Paso
                  </Button>
                )}

                {step.status === 'bloqueado' && !canStartStep(step, index) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Debes completar el paso anterior primero
                  </p>
                )}

                {step.status === 'en_proceso' && (
                  <>
                    <Button variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Subir Fotos
                    </Button>
                    <Button onClick={() => handleRequestValidation(step)}>
                      Solicitar Validación
                    </Button>
                  </>
                )}

                {step.status === 'validacion_pendiente' && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleValidateStep(step, false)}
                    >
                      Rechazar
                    </Button>
                    <Button 
                      onClick={() => handleValidateStep(step, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Validar y Completar
                    </Button>
                  </>
                )}

                {step.status === 'completado' && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Paso Completado
                  </Badge>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
