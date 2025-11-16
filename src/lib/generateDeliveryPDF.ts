import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DeliveryNoteData {
  documentNumber: string;
  date: string;
  customer: {
    name: string;
    address: string;
    taxId: string;
  };
  items: Array<{
    code: string;
    description: string;
    quantity: number;
    unit: string;
  }>;
  notes?: string;
}

export const generateDeliveryPDF = (data: DeliveryNoteData): jsPDF => {
  const doc = new jsPDF();

  // Logo y cabecera
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ALBARÁN DE ENTREGA', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('EcoZero Manufacturing', 20, 40);
  doc.text('C/ Ejemplo, 123', 20, 45);
  doc.text('28001 Madrid', 20, 50);
  doc.text('CIF: B12345678', 20, 55);

  // Datos del documento
  doc.setFont('helvetica', 'bold');
  doc.text(`Nº Albarán: ${data.documentNumber}`, 140, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(data.date).toLocaleDateString('es-ES')}`, 140, 45);

  // Cliente
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customer.name, 20, 75);
  doc.text(data.customer.address, 20, 80);
  doc.text(`CIF/NIF: ${data.customer.taxId}`, 20, 85);

  // Tabla de artículos
  autoTable(doc, {
    startY: 95,
    head: [['Código', 'Descripción', 'Cantidad', 'Unidad']],
    body: data.items.map(item => [
      item.code,
      item.description,
      item.quantity.toString(),
      item.unit
    ]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Observaciones
  if (data.notes) {
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', 20, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.notes, 20, finalY + 15, { maxWidth: 170 });
  }

  // Firma
  const pageHeight = doc.internal.pageSize.height;
  doc.line(20, pageHeight - 40, 80, pageHeight - 40);
  doc.text('Firma y Sello', 20, pageHeight - 35);

  return doc;
};

// Función para descargar
export const downloadDeliveryPDF = (data: DeliveryNoteData, filename?: string) => {
  const doc = generateDeliveryPDF(data);
  doc.save(filename || `albaran_${data.documentNumber}.pdf`);
};

// Función para obtener como blob (para enviar por email)
export const getDeliveryPDFBlob = (data: DeliveryNoteData): Blob => {
  const doc = generateDeliveryPDF(data);
  return doc.output('blob');
};
