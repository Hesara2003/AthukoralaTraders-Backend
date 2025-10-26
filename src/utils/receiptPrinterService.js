// Mock Receipt Printer Service
// Simulates physical receipt printer integration for POS operations

class ReceiptPrinterService {
  constructor() {
    this.isConnected = false;
    this.printerName = 'Virtual POS Printer';
    this.printerStatus = 'READY';
    this.paperLevel = 80; // Percentage
  }

  // Connect to printer
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.printerStatus = 'READY';
        console.log('✅ Receipt printer connected:', this.printerName);
        resolve({
          success: true,
          message: 'Printer connected successfully',
          printerName: this.printerName,
          status: this.printerStatus
        });
      }, 500);
    });
  }

  // Disconnect from printer
  async disconnect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false;
        this.printerStatus = 'DISCONNECTED';
        console.log('⚠️ Receipt printer disconnected');
        resolve({
          success: true,
          message: 'Printer disconnected'
        });
      }, 300);
    });
  }

  // Check printer status
  async checkStatus() {
    if (!this.isConnected) {
      return {
        success: false,
        status: 'DISCONNECTED',
        message: 'Printer not connected'
      };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          status: this.printerStatus,
          paperLevel: this.paperLevel,
          isReady: this.printerStatus === 'READY'
        });
      }, 100);
    });
  }

  // Print receipt
  async printReceipt(receiptData) {
    if (!this.isConnected) {
      throw new Error('Printer not connected. Please connect first.');
    }

    if (this.paperLevel < 10) {
      throw new Error('Paper level too low. Please refill paper.');
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          this.printerStatus = 'PRINTING';
          
          // Generate receipt content
          const receiptContent = this._generateReceiptContent(receiptData);
          
          // Simulate printing
          console.log('🖨️ Printing Receipt...\n', receiptContent);
          
          // Decrease paper level
          this.paperLevel -= 2;
          
          this.printerStatus = 'READY';
          
          resolve({
            success: true,
            message: 'Receipt printed successfully',
            receiptNumber: receiptData.receiptNumber || `RCP-${Date.now()}`,
            printedAt: new Date().toISOString()
          });
        } catch (error) {
          this.printerStatus = 'ERROR';
          reject(error);
        }
      }, 1500); // Simulate printing delay
    });
  }

  // Print order receipt (for customers)
  async printOrderReceipt(orderData) {
    const receiptData = {
      type: 'ORDER',
      receiptNumber: `ORD-${orderData.orderId}`,
      storeName: orderData.storeName || 'Athukorala Traders',
      storeAddress: orderData.storeAddress || '123 Main Street, Colombo, Sri Lanka',
      storePhone: orderData.storePhone || '+94 11 234 5678',
      date: new Date().toLocaleString(),
      cashier: orderData.cashier || 'Staff',
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      discount: orderData.discount || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      amountPaid: orderData.amountPaid,
      change: orderData.change || 0,
      customerName: orderData.customerName,
      footerMessage: 'Thank you for your business!'
    };

    return await this.printReceipt(receiptData);
  }

  // Print refund receipt
  async printRefundReceipt(refundData) {
    const receiptData = {
      type: 'REFUND',
      receiptNumber: `REF-${refundData.refundId}`,
      storeName: refundData.storeName || 'Athukorala Traders',
      storeAddress: refundData.storeAddress || '123 Main Street, Colombo, Sri Lanka',
      date: new Date().toLocaleString(),
      originalOrderId: refundData.originalOrderId,
      items: refundData.items,
      refundAmount: refundData.refundAmount,
      refundMethod: refundData.refundMethod,
      reason: refundData.reason,
      processedBy: refundData.processedBy,
      footerMessage: 'Refund processed successfully'
    };

    return await this.printReceipt(receiptData);
  }

  // Print daily summary
  async printDailySummary(summaryData) {
    const receiptData = {
      type: 'DAILY_SUMMARY',
      receiptNumber: `SUM-${new Date().toISOString().split('T')[0]}`,
      storeName: summaryData.storeName || 'Athukorala Traders',
      date: new Date().toLocaleString(),
      totalSales: summaryData.totalSales,
      totalOrders: summaryData.totalOrders,
      cashSales: summaryData.cashSales,
      cardSales: summaryData.cardSales,
      refunds: summaryData.refunds,
      netSales: summaryData.netSales,
      cashier: summaryData.cashier,
      footerMessage: 'End of Day Report'
    };

    return await this.printReceipt(receiptData);
  }

  // Print barcode label
  async printBarcodeLabel(productData) {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🏷️ Printing Barcode Label:', {
          sku: productData.sku,
          name: productData.name,
          price: productData.price,
          barcode: productData.barcode || this._generateBarcode(productData.sku)
        });

        resolve({
          success: true,
          message: 'Barcode label printed successfully',
          barcode: productData.barcode || this._generateBarcode(productData.sku)
        });
      }, 800);
    });
  }

  // Test print
  async testPrint() {
    const testData = {
      type: 'TEST',
      receiptNumber: 'TEST-' + Date.now(),
      storeName: 'Athukorala Traders',
      date: new Date().toLocaleString(),
      footerMessage: 'Test print successful ✓'
    };

    return await this.printReceipt(testData);
  }

  // Generate receipt content (formatted text)
  _generateReceiptContent(data) {
    let content = '';
    const width = 40;
    const line = '='.repeat(width);
    const dottedLine = '-'.repeat(width);

    // Header
    content += line + '\n';
    content += this._centerText(data.storeName || 'STORE NAME', width) + '\n';
    if (data.storeAddress) {
      content += this._centerText(data.storeAddress, width) + '\n';
    }
    if (data.storePhone) {
      content += this._centerText(data.storePhone, width) + '\n';
    }
    content += line + '\n\n';

    // Receipt type and number
    content += this._centerText((data.type || 'RECEIPT').toUpperCase(), width) + '\n';
    content += this._centerText(`#${data.receiptNumber}`, width) + '\n';
    content += `Date: ${data.date}\n`;
    if (data.cashier) {
      content += `Cashier: ${data.cashier}\n`;
    }
    content += dottedLine + '\n\n';

    // Items
    if (data.items && data.items.length > 0) {
      content += 'ITEMS:\n';
      data.items.forEach(item => {
        const itemName = item.name.substring(0, 25);
        const qty = `${item.quantity}x`;
        const price = this._formatCurrency(item.price || item.unitPrice);
        const total = this._formatCurrency(
          item.quantity * (item.price || item.unitPrice)
        );
        
        content += `${itemName}\n`;
        content += `  ${qty} @ ${price}${' '.repeat(width - qty.length - price.length - total.length - 3)}${total}\n`;
      });
      content += dottedLine + '\n';
    }

    // Totals
    if (data.subtotal !== undefined) {
      content += this._formatLine('Subtotal:', this._formatCurrency(data.subtotal), width) + '\n';
    }
    if (data.discount) {
      content += this._formatLine('Discount:', '-' + this._formatCurrency(data.discount), width) + '\n';
    }
    if (data.tax !== undefined) {
      content += this._formatLine('Tax:', this._formatCurrency(data.tax), width) + '\n';
    }
    if (data.total !== undefined) {
      content += line + '\n';
      content += this._formatLine('TOTAL:', this._formatCurrency(data.total), width, true) + '\n';
      content += line + '\n';
    }

    // Payment details
    if (data.paymentMethod) {
      content += '\n';
      content += `Payment Method: ${data.paymentMethod}\n`;
    }
    if (data.amountPaid !== undefined) {
      content += this._formatLine('Amount Paid:', this._formatCurrency(data.amountPaid), width) + '\n';
    }
    if (data.change) {
      content += this._formatLine('Change:', this._formatCurrency(data.change), width) + '\n';
    }

    // Refund specific
    if (data.type === 'REFUND') {
      content += '\n';
      content += `Original Order: ${data.originalOrderId}\n`;
      content += `Refund Amount: ${this._formatCurrency(data.refundAmount)}\n`;
      if (data.reason) {
        content += `Reason: ${data.reason}\n`;
      }
    }

    // Daily summary specific
    if (data.type === 'DAILY_SUMMARY') {
      content += '\n';
      content += this._formatLine('Total Orders:', data.totalOrders, width) + '\n';
      content += this._formatLine('Cash Sales:', this._formatCurrency(data.cashSales), width) + '\n';
      content += this._formatLine('Card Sales:', this._formatCurrency(data.cardSales), width) + '\n';
      content += this._formatLine('Refunds:', '-' + this._formatCurrency(data.refunds), width) + '\n';
      content += line + '\n';
      content += this._formatLine('NET SALES:', this._formatCurrency(data.netSales), width, true) + '\n';
    }

    // Footer
    content += '\n' + line + '\n';
    if (data.footerMessage) {
      content += this._centerText(data.footerMessage, width) + '\n';
    }
    content += this._centerText('*** END OF RECEIPT ***', width) + '\n';
    content += line + '\n';

    return content;
  }

  // Helper methods
  _centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  _formatLine(label, value, width, bold = false) {
    const valueStr = value.toString();
    const spaces = width - label.length - valueStr.length;
    return label + ' '.repeat(Math.max(1, spaces)) + valueStr;
  }

  _formatCurrency(amount) {
    return `LKR ${amount.toFixed(2)}`;
  }

  _generateBarcode(sku) {
    return `*${sku}*`;
  }

  // Refill paper (for testing)
  refillPaper() {
    this.paperLevel = 100;
    console.log('📄 Paper refilled to 100%');
    return {
      success: true,
      paperLevel: this.paperLevel
    };
  }

  // Get printer info
  getInfo() {
    return {
      printerName: this.printerName,
      isConnected: this.isConnected,
      status: this.printerStatus,
      paperLevel: this.paperLevel,
      type: 'POS Receipt Printer (Mock)',
      model: 'Virtual Printer v1.0'
    };
  }
}

// Singleton instance
const receiptPrinter = new ReceiptPrinterService();

export default receiptPrinter;
