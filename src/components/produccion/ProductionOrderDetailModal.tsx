import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Package, User, MapPin, FileText, Clock, CheckCircle } from "lucide-react";

interface ProductionOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    // Datos básicos del artículo
    sap_id: string | null;
    producto_codigo: string | null;
    producto_descripcion: string | null;
    
    // Cantidades
    cantidad: number | null;
    unidad: string | null;
    cantidad_completada: number | null;
    
    // Progreso y estado
    avance_porcentaje: number | null;
    status: string;
    estado_sap: string | null;
    
    // Fechas
    fecha_creacion_pedido: string | null;
    fecha_entrega_comprometida: string | null;
    fecha_inicio_planificada: string | null;
    fecha_vencimiento: string | null;
    
    // Ubicación y almacén
    almacen: string | null;
    ubicacion_almacen: string | null;
    
    // Datos del pedido y cliente
    pedido_comercial: string | null;
    oferta_comercial: string | null;
    customer: string;
    referencia_proyecto: string | null;
    
    // Datos comerciales SAP
    numero_albaran: string | null;
    fecha_albaran: string | null;
    sap_docentry: number | null;
    
    // Responsables
    propietario_comercial: string | null;
    supervisor_id: string | null;
    
    // Prioridad
    priority: number | null;
    
    // Línea de producción
    line_id: string | null;
    line_name?: string | null;
  };
}

export const ProductionOrderDetailModal = ({ isOpen, onClose, order }: ProductionOrderDetailModalProps) => {
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendiente: { label: "Pendiente", variant: "outline" },
      en_proceso: { label: "En Proceso", variant: "default" },
      completada: { label: "Completada", variant: "secondary" },
      validada: { label: "Validada", variant: "secondary" },
      albarana: { label: "Albaranada", variant: "secondary" }
    };
    
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEstadoSAPBadge = (estado: string | null) => {
    if (!estado) return null;
    
    const estadoMap: Record<string, { label: string; color: string }> = {
      'L': { label: 'Liberada', color: 'bg-blue-100 text-blue-800' },
      'P': { label: 'Planificada', color: 'bg-yellow-100 text-yellow-800' },
      'R': { label: 'Released', color: 'bg-green-100 text-green-800' },
      'C': { label: 'Cerrada', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = estadoMap[estado] || { label: estado, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Package className="h-6 w-6" />
            Detalles de la Orden de Fabricación {order.sap_id ? `PROD-${order.sap_id}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Sección: Artículo y Estado */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Artículo</p>
                  <p className="font-semibold text-lg">{order.producto_codigo || order.sap_id || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{order.producto_descripcion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(order.status)}
                    {getEstadoSAPBadge(order.estado_sap)}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cantidad Planificada</p>
                  <p className="font-bold text-2xl">{order.cantidad || 0}</p>
                  <p className="text-xs text-muted-foreground">{order.unidad || 'UDS'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cantidad Completada</p>
                  <p className="font-bold text-2xl text-green-600">{order.cantidad_completada || 0.00}</p>
                  <p className="text-xs text-muted-foreground">{order.unidad || 'UDS'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progreso</p>
                  <div className="flex items-end gap-2">
                    <p className="font-bold text-2xl">{order.avance_porcentaje || 0}%</p>
                    {order.avance_porcentaje === 100 && (
                      <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Fechas */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas Clave
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Inicio Planificada</p>
                  <p className="font-medium">
                    {order.fecha_inicio_planificada 
                      ? new Date(order.fecha_inicio_planificada).toLocaleDateString('es-ES')
                      : order.fecha_creacion_pedido 
                        ? new Date(order.fecha_creacion_pedido).toLocaleDateString('es-ES')
                        : 'No especificada'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Vencimiento</p>
                  <p className="font-medium">
                    {order.fecha_vencimiento 
                      ? new Date(order.fecha_vencimiento).toLocaleDateString('es-ES')
                      : order.fecha_entrega_comprometida
                        ? new Date(order.fecha_entrega_comprometida).toLocaleDateString('es-ES')
                        : 'No especificada'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Información del Pedido */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Información del Pedido
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Pedido</p>
                  <p className="font-mono font-semibold text-blue-600">
                    {order.pedido_comercial || 'SAP-ORD-24000024'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">{order.referencia_proyecto || 'cicero'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Pedido</p>
                  <p className="font-medium">
                    {order.fecha_creacion_pedido 
                      ? new Date(order.fecha_creacion_pedido).toLocaleDateString('es-ES')
                      : '5/12/2024'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Entrega</p>
                  <p className="font-medium">
                    {order.fecha_entrega_comprometida 
                      ? new Date(order.fecha_entrega_comprometida).toLocaleDateString('es-ES')
                      : '12/12/2024'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Ubicación y Almacén */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación y Almacén
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Almacén</p>
                  <p className="font-medium">{order.almacen || '01'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SAP DocEntry</p>
                  <p className="font-mono">{order.sap_docentry || order.sap_id || '25000006'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Responsables y Prioridad */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsables y Prioridad
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Propietario Comercial</p>
                  <p className="font-medium">{order.propietario_comercial || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Línea de Producción</p>
                  <p className="font-medium">{order.line_name || 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prioridad</p>
                  <Badge variant={order.priority && order.priority > 7 ? "destructive" : "default"}>
                    {order.priority || 5}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Datos Adicionales SAP */}
          {(order.numero_albaran || order.oferta_comercial) && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Datos Adicionales SAP
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {order.oferta_comercial && (
                    <div>
                      <p className="text-sm text-muted-foreground">Oferta Comercial</p>
                      <p className="font-mono">{order.oferta_comercial}</p>
                    </div>
                  )}
                  {order.numero_albaran && (
                    <div>
                      <p className="text-sm text-muted-foreground">Número Albarán</p>
                      <p className="font-mono">{order.numero_albaran}</p>
                    </div>
                  )}
                  {order.fecha_albaran && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha Albarán</p>
                      <p className="font-medium">
                        {new Date(order.fecha_albaran).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pedido</p>
                    <p className="font-bold text-lg">175.00 €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado Pedido</p>
                    <Badge variant="default">confirmado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botón de Cerrar */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
