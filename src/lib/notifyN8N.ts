/**
 * Utility para notificar alertas críticas a N8N
 * Envía webhook cuando severity >= 4 (o 'critical'/'warning')
 */

const N8N_URL = 'https://n8n-n8n.wgjrqh.easypanel.host';

export interface CriticalAlert {
  alert_type: string;
  severity: number | string; // Soporta ambos: número (1-5) o string ('info', 'warning', 'critical')
  message: string;
  of_id?: string;
  created_at?: string;
}

/**
 * Convierte severity a número si es string
 */
const normalizeSeverity = (severity: number | string): number => {
  if (typeof severity === 'number') return severity;
  
  // Mapeo de strings a números
  const severityMap: Record<string, number> = {
    'info': 1,
    'warning': 3,
    'critical': 5
  };
  
  return severityMap[severity.toLowerCase()] || 1;
};

/**
 * Envía notificación a N8N cuando se crea una alerta crítica
 * @param alert Datos de la alerta
 */
export const notifyCriticalAlert = async (alert: CriticalAlert): Promise<void> => {
  const severityNum = normalizeSeverity(alert.severity);
  
  // Solo notificar si severity >= 4 (Alta o Crítica)
  if (severityNum < 4) {
    return;
  }

  try {
    await fetch(`${N8N_URL}/webhook/critical-alert`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        alert_type: alert.alert_type,
        severity: severityNum,
        message: alert.message,
        of_id: alert.of_id || null,
        created_at: alert.created_at || new Date().toISOString()
      })
    });

    console.log('✅ Critical alert sent to N8N:', alert.alert_type, `(severity: ${severityNum})`);
  } catch (error) {
    console.error('❌ Error sending critical alert to N8N:', error);
    // No lanzamos error para no bloquear la creación de la alerta
  }
};

/**
 * Wrapper para enviar múltiples alertas
 * @param alerts Array de alertas
 */
export const notifyMultipleCriticalAlerts = async (alerts: CriticalAlert[]): Promise<void> => {
  const criticalAlerts = alerts.filter(a => normalizeSeverity(a.severity) >= 4);
  
  if (criticalAlerts.length === 0) {
    return;
  }

  await Promise.allSettled(
    criticalAlerts.map(alert => notifyCriticalAlert(alert))
  );
};
