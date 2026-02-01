
import { Table, AppSettings, OrderItem, CartItem, CustomerDetails, SelectedModifier } from '../types';

interface PrintSettings extends AppSettings {
  businessName: string;
}

/**
 * Limpia el texto de caracteres especiales que la mayoría de las impresoras térmicas
 * no pueden procesar correctamente (especialmente la Ñ y los acentos).
 */
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/\u00d1/g, 'N')
    .replace(/\u00f1/g, 'N')
    .toUpperCase()
    .replace(/[^\x20-\x7E\n]/g, '') // Mantiene solo ASCII imprimible y \n para evitar que bytes extra confundan a la impresora
    .trim();
};

// Helper to format text lines for the printer
const formatLine = (left: string, right: string, width: number): string => {
  const cleanLeft = cleanText(left);
  const cleanRight = cleanText(right);
  const leftTruncated = cleanLeft.substring(0, width - cleanRight.length - 1);
  const spaceCount = width - leftTruncated.length - cleanRight.length;
  return `${leftTruncated}${' '.repeat(Math.max(0, spaceCount))}${cleanRight}\n`;
};

export const generateReceiptCommands = (cart: CartItem[], customer: CustomerDetails, settings: PrintSettings, waiterName: string, title: string = 'RECIBO DE PEDIDO', previousTotal: number = 0): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';

  const cartTotal = cart.reduce((acc, item) => {
    const modTotal = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
    return acc + ((item.price + modTotal) * item.quantity);
  }, 0);

  // Initialize
  commands += '\x1B\x40'; // Initialize printer
  // Quitamos la selección de página de códigos específica para evitar incompatibilidad en modelos básicos
  // commands += '\x1B\x74\x02'; 

  // Header
  commands += '\x1B\x61\x31'; // Center align
  commands += '\x1B\x21\x30'; // Double height, double width
  commands += `${cleanText(settings.businessName)}\n`;
  commands += '\x1B\x21\x00'; // Normal size
  commands += `${cleanText(title)}\n`;
  commands += '\x1B\x61\x30'; // Left align

  // Order Details
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES');
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  commands += formatLine(`REF: ${customer.name}`, timeStr, paperWidth);
  commands += `FECHA: ${dateStr}\n`;
  commands += `ATENDIDO POR: ${cleanText(waiterName)}\n`;
  commands += divider;

  // Order Items
  commands += formatLine('PRODUCTO', 'TOTAL', paperWidth);
  commands += divider;

  // Insertar saldo pendiente como la primera línea si existe
  if (previousTotal > 0) {
    commands += `\x1B\x21\x08`; // Bold
    const debtLabel = cleanText("(- SALDO PENDIENTE -)");
    commands += `${debtLabel}\n`;
    commands += formatLine("  MONTO PREVIO", `$${previousTotal.toFixed(2)}`, paperWidth);
    commands += '\x1B\x21\x00'; // Normal
    commands += '-'.repeat(Math.floor(paperWidth / 2)) + '\n';
  }

  cart.forEach(item => {
    const modTotal = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
    const itemTotal = (item.price + modTotal) * item.quantity;

    commands += `\x1B\x21\x08`; // Bold
    commands += formatLine(`${item.quantity}X ${item.name}`, `$${itemTotal.toFixed(2)}`, paperWidth);
    commands += '\x1B\x21\x00'; // Normal

    if (item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(m => {
        // Formateo especial para modificadores de pizza (mitades e ingredientes base)
        let label = m.groupTitle;

        // Limpiar iconos y normalizar nombres de grupos para la impresora
        if (label.includes('IZQUIERDA')) label = 'MITAD IZQ';
        else if (label.includes('DERECHA')) label = 'MITAD DER';
        else if (label.includes('TODA LA PIZZA')) label = 'TODA';
        else if (label.includes('INGREDIENTES BASE')) label = 'BASE';
        else if (label.includes('ADICIONAL') || label.includes('EXTRA')) label = 'ADIC';
        else if (label.includes('Tamanio') || label.includes('Tamaño')) label = 'TAM';
        else label = label.substring(0, 10); // Limitar otros grupos

        const text = `  ${label}: ${m.option.name}`;
        // Dividir el texto si es muy largo para que no se corte feo
        const wrappedText = text.match(new RegExp(`.{1,${paperWidth}}`, 'g')) || [text];
        wrappedText.forEach(line => {
          commands += cleanText(line) + '\n';
        });
      });
    }
  });

  commands += divider;

  // Totals
  const finalTotal = cartTotal + previousTotal;

  commands += '\x1B\x61\x32'; // Right align
  commands += '\x1B\x21\x30'; // Large text
  commands += `TOTAL: $${finalTotal.toFixed(2)}\n`;
  commands += '\x1B\x21\x00'; // Reset

  commands += '\x1B\x61\x30'; // Left align
  commands += formatLine('METODO:', customer.paymentMethod, paperWidth);

  // Footer
  if (customer.instructions) {
    commands += divider;
    commands += 'NOTAS:\n';
    commands += `${cleanText(customer.instructions)}\n`;
  }

  commands += '\n\x1B\x61\x31';
  commands += 'GRACIAS POR SU COMPRA!\n';
  commands += '\x1B\x21\x01'; // Small font
  commands += `ATENDIDO POR: ${cleanText(waiterName)}\n`;
  commands += '\x1B\x21\x00'; // Normal size

  // AVANCE DE PAPEL Y CORTE
  commands += '\n\n\n\n\n';
  commands += '\x1D\x56\x01'; // Comando estándar de corte parcial / avance completo en la mayoría de las térmicas

  return commands;
};

export const generateTestPrintCommands = (settings: PrintSettings): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';

  commands += '\x1B\x40';
  commands += '\x1B\x74\x02';
  commands += '\x1B\x61\x31';
  commands += '\x1B\x21\x30';
  commands += `${cleanText(settings.businessName)}\n`;
  commands += '\x1B\x21\x00';
  commands += divider;
  commands += 'PRUEBA DE IMPRESION OK\n';
  commands += divider;
  commands += '\x1B\x61\x30';
  commands += `ANCHO: ${paperWidth} CARACTERES\n`;
  commands += 'ESTA ES UNA PRUEBA DE TEXTO\n';
  commands += 'LIMPIO DE ACENTOS Y ENES.\n\n';
  commands += '\x1B\x61\x31';
  commands += 'FECHA: ' + new Date().toLocaleDateString() + '\n';
  commands += 'HORA: ' + new Date().toLocaleTimeString() + '\n';

  commands += '\n\n\n\n\n\n';
  commands += '\x1D\x56\x41\x03';

  return commands;
};

export const generateEscPosCommands = (table: Table, settings: PrintSettings, waiterName: string, printType: 'ORIGINAL' | 'COPIA'): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';
  commands += '\x1B\x40';
  // commands += '\x1B\x74\x02';
  commands += '\x1B\x61\x31';
  commands += '\x1B\x21\x08';
  commands += `${printType === 'COPIA' ? '--- COPIA ---' : cleanText(settings.businessName)}\n`;
  commands += '\x1B\x21\x00';
  commands += `COMANDA DE COCINA\n\n`;
  commands += '\x1B\x61\x30';
  const orderIdentifier = table.orderType === 'para llevar' ? `PEDIDO #${table.number}` : `MESA: ${table.number}`;
  commands += formatLine(orderIdentifier, new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), paperWidth);
  commands += `MESONERO: ${cleanText(waiterName)}\n`;
  if (table.customerName) commands += `CLIENTE: ${cleanText(table.customerName)}\n`;
  commands += divider;
  table.order.filter(item => item.status !== 'cancelled').forEach(item => {
    commands += `\x1B\x21\x08`;
    commands += `${item.quantity}X ${cleanText(item.name)}\n`;
    commands += '\x1B\x21\x00';
    if (item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(m => {
        let label = m.groupTitle;

        if (label.includes('IZQUIERDA')) label = 'MITAD IZQ';
        else if (label.includes('DERECHA')) label = 'MITAD DER';
        else if (label.includes('TODA LA PIZZA')) label = 'TODA';
        else if (label.includes('INGREDIENTES BASE')) label = 'BASE';
        else if (label.includes('ADICIONAL') || label.includes('EXTRA')) label = 'ADIC';
        else if (label.includes('Tamanio') || label.includes('Tamaño')) label = 'TAM';
        else label = label.substring(0, 10);

        const text = `  ${label}: ${m.option.name}`;
        const wrappedText = text.match(new RegExp(`.{1,${paperWidth}}`, 'g')) || [text];
        wrappedText.forEach(line => {
          commands += cleanText(line) + '\n';
        });
      });
    }
  });
  if (table.observations?.trim()) {
    commands += divider + 'NOTAS:\n' + cleanText(table.observations.trim()) + '\n';
  }
  commands += '\n\n\n\n\n\x1D\x56\x01';
  return commands;
};

export const generateKitchenOrderCommands = (table: Table, settings: PrintSettings, waiterName: string, actionType: 'Pedido Nuevo' | 'Adicional' | 'Cancelación', itemsToPrint: OrderItem[]): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';
  commands += '\x1B\x40';
  // commands += '\x1B\x74\x02';
  commands += '\x1B\x61\x31';
  commands += '\x1B\x21\x30';
  commands += `${cleanText(actionType)}\n`;
  commands += '\x1B\x21\x00';
  commands += `${cleanText(settings.businessName)}\n`;
  commands += '\x1B\x61\x30';
  const orderIdentifier = table.orderType === 'para llevar' ? `PEDIDO #${table.number}` : `MESA: ${table.number}`;
  commands += formatLine(orderIdentifier, new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), paperWidth);
  commands += `MESONERO: ${cleanText(waiterName)}\n`;
  commands += divider;
  itemsToPrint.forEach(item => {
    commands += `\x1B\x21\x08${item.quantity}X ${cleanText(item.name)}\n\x1B\x21\x00`;
    if (item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(m => {
        let label = m.groupTitle;

        if (label.includes('IZQUIERDA')) label = 'MITAD IZQ';
        else if (label.includes('DERECHA')) label = 'MITAD DER';
        else if (label.includes('TODA LA PIZZA')) label = 'TODA';
        else if (label.includes('INGREDIENTES BASE')) label = 'BASE';
        else if (label.includes('ADICIONAL') || label.includes('EXTRA')) label = 'ADIC';
        else if (label.includes('Tamanio') || label.includes('Tamaño')) label = 'TAM';
        else label = label.substring(0, 10);

        const text = `  ${label}: ${m.option.name}`;
        const wrappedText = text.match(new RegExp(`.{1,${paperWidth}}`, 'g')) || [text];
        wrappedText.forEach(line => {
          commands += cleanText(line) + '\n';
        });
      });
    }
  });
  if ((actionType === 'Pedido Nuevo' || actionType === 'Adicional') && table.observations?.trim()) {
    commands += divider + 'OBS:\n' + cleanText(table.observations.trim()) + '\n';
  }
  commands += '\n\n\n\n\n\x1D\x56\x01';
  return commands;
};
