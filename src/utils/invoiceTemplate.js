export const buildInvoiceHTML = (invoice) => {
  const fmt = (n) => '₹ ' + parseFloat(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const payoutAmount = parseFloat(invoice.payoutAmount) || 0;
  
  // Basic calculation for grandTotal
  let grandTotal = invoice.totalAmount ? parseFloat(invoice.totalAmount) : payoutAmount;

  const numberToWords = (num) => {
    return 'Amount in words format to be implemented';
  };

  const invoiceDate = invoice.dateFormatted || new Date().toLocaleDateString('en-IN');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tax Invoice</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 20px; background: #fff; }
      .title { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; }
      .header-box { background-color: #f0f8ff; padding: 15px; margin-bottom: 20px; border: 1px solid #e0e0e0; }
      .header-box h3 { margin: 0 0 5px 0; font-size: 14px; }
      .row { display: flex; justify-content: space-between; }
      .col { flex: 1; }
      .col-right { text-align: right; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .details-table td { padding: 4px; vertical-align: top; }
      .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
      .items-table th { background-color: #f0f8ff; }
      .footer-box { border-top: 1px solid #000; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="title">TAX INVOICE</div>
    
    <div class="header-box">
      <h3>Bill From</h3>
      <strong>\${invoice.billFromName || 'N/A'}</strong><br/>
      \${invoice.billFromAddress || 'N/A'}<br/><br/>
      <div class="row">
        <div class="col">
          PAN NO: \${invoice.billFromPan || 'N/A'}<br/>
          GST NO: \${invoice.billFromGst || 'N/A'}
        </div>
        <div class="col col-right">
          Mobile: \${invoice.billFromPhone || 'N/A'}<br/>
          Email: \${invoice.billFromEmail || 'N/A'}
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col" style="padding-right: 20px;">
        <h3>Bill To</h3>
        <strong>\${invoice.billToName || invoice.customerName || 'N/A'}</strong><br/>
        \${invoice.billToAddress || 'N/A'}<br/><br/>
        Phone: \${invoice.billToPhone || 'N/A'}<br/>
        Email: \${invoice.billToEmail || 'N/A'}<br/>
        PAN: \${invoice.billToPan || 'N/A'}<br/>
        GSTIN: \${invoice.billToGst || 'N/A'}
      </div>
      <div class="col">
        <table class="details-table">
          <tr><td>Invoice No:</td><td>\${invoice.invoiceNumber || 'N/A'}</td></tr>
          <tr><td>Ref No:</td><td>\${invoice.trackNumber || 'N/A'}</td></tr>
          <tr><td>Invoice Date:</td><td>\${invoiceDate}</td></tr>
          <tr><td>Place of Supply:</td><td>\${invoice.placeOfSupply || 'N/A'}</td></tr>
          <tr><td>Supply under Reverse charge (Yes/No):</td><td>No</td></tr>
        </table>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>S/R NO</th>
          <th>Service Description</th>
          <th>Invoice Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>\${invoice.serviceType || 'Commission & Brokerage'}\${invoice.loanType ? ' - ' + invoice.loanType : ''}</td>
          <td>\${fmt(grandTotal)}</td>
        </tr>
        <tr>
          <td></td>
          <td><strong>Total</strong></td>
          <td><strong>\${fmt(grandTotal)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="footer-box">
      <u>Amount in words:-</u><br/>
      \${numberToWords(grandTotal)}
    </div>
  </body>
  </html>
  `;
};
