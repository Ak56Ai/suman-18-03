interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  payment_method: string;
  order_items: OrderItem[];
  shipping_address: any;
}

export const generateInvoicePDF = (order: Order) => {
  const formatOrderId = (orderId: string) => {
    const lastPart = orderId.split('-').pop() || '';
    return `RKIN-${lastPart}`;
  };

  const subtotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);
  const gst = subtotal * 0.18;
  const finalTotal = subtotal + gst;

  // Create HTML content for the invoice
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice - ${formatOrderId(order.id)}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #4CAF50; margin-bottom: 5px; }
            .company-tagline { color: #666; font-size: 14px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info, .billing-info { width: 48%; }
            .invoice-info h3, .billing-info h3 { color: #4CAF50; margin-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #4CAF50; color: white; }
            .table tr:nth-child(even) { background-color: #f9f9f9; }
            .totals { margin-top: 20px; text-align: right; }
            .totals table { margin-left: auto; width: 300px; }
            .total-row { font-weight: bold; font-size: 16px; background-color: #4CAF50 !important; color: white; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">NaturZen</div>
            <div class="company-tagline">Natural Wellness & Meditation Products</div>
        </div>

        <div class="invoice-details">
            <div class="invoice-info">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${formatOrderId(order.id)}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                <p><strong>Payment Method:</strong> ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>
            <div class="billing-info">
                <h3>Billing Address</h3>
                <p><strong>${order.shipping_address.fullName}</strong></p>
                <p>${order.shipping_address.address}</p>
                <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}</p>
                <p>Phone: ${order.shipping_address.phone}</p>
                <p>Email: ${order.shipping_address.email}</p>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.order_items.map(item => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td>₹${item.total_price.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table class="table">
                <tr>
                    <td>Subtotal:</td>
                    <td>₹${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>GST (18%):</td>
                    <td>₹${gst.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Shipping:</td>
                    <td>Free</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Amount:</strong></td>
                    <td><strong>₹${finalTotal.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Thank you for choosing NaturZen!</p>
            <p>For any queries, contact us at support@naturzen.com | +91 98765 43210</p>
            <p>Visit us at www.naturzen.com</p>
        </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
};