const SAP_BASE_URL = import.meta.env.VITE_SAP_BASE_URL || '';
const SAP_COMPANY_DB = import.meta.env.VITE_SAP_COMPANY_DB || '';

interface SAPSession {
  SessionId: string;
  Version: string;
  SessionTimeout: number;
}

export class SAPClient {
  private sessionId: string | null = null;
  private sessionExpiry: number = 0;

  constructor() {
    if (!SAP_BASE_URL || !SAP_COMPANY_DB) {
      console.warn('SAP credentials not configured');
    }
  }

  // ==================== AUTENTICACIÓN ====================
  
  private async login(): Promise<void> {
    const response = await fetch(`${SAP_BASE_URL}/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CompanyDB: SAP_COMPANY_DB,
        UserName: import.meta.env.VITE_SAP_USERNAME,
        Password: import.meta.env.VITE_SAP_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error('SAP Login failed');
    }

    const session: SAPSession = await response.json();
    this.sessionId = session.SessionId;
    this.sessionExpiry = Date.now() + (session.SessionTimeout * 60 * 1000);
  }

  private async ensureSession(): Promise<void> {
    if (!this.sessionId || Date.now() >= this.sessionExpiry) {
      await this.login();
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.ensureSession();

    const response = await fetch(`${SAP_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `B1SESSION=${this.sessionId}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SAP API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ==================== ÓRDENES DE FABRICACIÓN ====================
  
  async getProductionOrders(params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    let filter = '';
    
    if (params?.status) {
      filter += `ProductionOrderStatus eq '${params.status}'`;
    }
    if (params?.fromDate) {
      filter += (filter ? ' and ' : '') + `PostingDate ge '${params.fromDate}'`;
    }
    if (params?.toDate) {
      filter += (filter ? ' and ' : '') + `PostingDate le '${params.toDate}'`;
    }

    const queryParams = filter ? `?$filter=${encodeURIComponent(filter)}` : '';
    
    return this.request<any>(`/ProductionOrders${queryParams}`);
  }

  async getProductionOrder(docEntry: number) {
    return this.request<any>(`/ProductionOrders(${docEntry})`);
  }

  async createProductionOrder(data: {
    ItemNo: string;
    ProductionOrderQuantity: number;
    PlannedQuantity: number;
    Warehouse: string;
    DueDate?: string;
    Comments?: string;
  }) {
    return this.request<any>('/ProductionOrders', {
      method: 'POST',
      body: JSON.stringify({
        ItemNo: data.ItemNo,
        ProductionOrderQuantity: data.ProductionOrderQuantity,
        PlannedQuantity: data.PlannedQuantity,
        Warehouse: data.Warehouse,
        DueDate: data.DueDate,
        Comments: data.Comments,
        ProductionOrderStatus: 'P', // Planned
      }),
    });
  }

  async updateProductionOrder(docEntry: number, data: any) {
    return this.request<any>(`/ProductionOrders(${docEntry})`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async closeProductionOrder(docEntry: number) {
    return this.updateProductionOrder(docEntry, {
      ProductionOrderStatus: 'C' // Closed
    });
  }

  // ==================== ALBARANES ====================
  
  async createDeliveryNote(data: {
    CardCode: string;
    DocDate: string;
    DocDueDate: string;
    DocumentLines: Array<{
      ItemCode: string;
      Quantity: number;
      WarehouseCode: string;
      UnitPrice: number;
    }>;
    Comments?: string;
  }) {
    return this.request<any>('/DeliveryNotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDeliveryNote(docEntry: number) {
    return this.request<any>(`/DeliveryNotes(${docEntry})`);
  }

  // ==================== ARTÍCULOS ====================
  
  async getItems(params?: { filter?: string }) {
    const queryParams = params?.filter ? `?$filter=${encodeURIComponent(params.filter)}` : '';
    return this.request<any>(`/Items${queryParams}`);
  }

  async getItem(itemCode: string) {
    return this.request<any>(`/Items('${itemCode}')`);
  }

  // ==================== CLIENTES ====================
  
  async getBusinessPartners(type: 'C' | 'S' = 'C') {
    return this.request<any>(`/BusinessPartners?$filter=CardType eq '${type}'`);
  }

  async getBusinessPartner(cardCode: string) {
    return this.request<any>(`/BusinessPartners('${cardCode}')`);
  }

  // ==================== STOCK ====================
  
  async getStockByWarehouse(itemCode: string) {
    return this.request<any>(`/Items('${itemCode}')/ItemWarehouseInfoCollection`);
  }

  // ==================== LOGOUT ====================
  
  async logout(): Promise<void> {
    if (!this.sessionId) return;

    try {
      await fetch(`${SAP_BASE_URL}/Logout`, {
        method: 'POST',
        headers: {
          'Cookie': `B1SESSION=${this.sessionId}`,
        },
      });
    } catch (error) {
      console.error('SAP Logout error:', error);
    } finally {
      this.sessionId = null;
      this.sessionExpiry = 0;
    }
  }
}

// Exportar instancia singleton
export const sap = new SAPClient();
