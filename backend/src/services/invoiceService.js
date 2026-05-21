  const invoiceModel = require('../models/invoiceModel');

const GST_RATE = 0.09; // 9% each for CGST and SGST
const TDS_RATE = 0.02; // 2% TDS

/**
 * Calculate tax breakdown based on GST registration status.
 *
 * GST Registered:
 *   Grand Total = Payout - TDS (2%)
 *   (No SGST/CGST deduction — connector charges GST separately)
 *
 * NOT GST Registered:
 *   Grand Total = Payout - SGST (9%) - CGST (9%) - TDS (2%)
 */
const calculateTaxBreakdown = (payoutAmount, isGstRegistered) => {
  const payout = parseFloat(payoutAmount) || 0;
  const tds = Math.round(payout * TDS_RATE * 100) / 100;

  if (isGstRegistered) {
    // GST registered: only TDS deducted
    return {
      sgst: 0,
      cgst: 0,
      tds,
      isGstRegistered: true,
      grandTotal: Math.round((payout - tds) * 100) / 100,
    };
  }

  // Not GST registered: SGST + CGST + TDS all deducted
  const sgst = Math.round(payout * GST_RATE * 100) / 100;
  const cgst = Math.round(payout * GST_RATE * 100) / 100;
  return {
    sgst,
    cgst,
    tds,
    isGstRegistered: false,
    grandTotal: Math.round((payout - sgst - cgst - tds) * 100) / 100,
  };
};


const generateInvoice = async (connectorId, payoutData) => {
  // Check if invoice already exists for this payout
  const existing = await invoiceModel.getByTrackId(payoutData.trackId);
  if (existing) {
    return formatInvoice(existing);
  }

  const payoutAmount = parseFloat(payoutData.payoutAmount) || 0;
  const isGstRegistered = payoutData.isGstRegistered === true;
  const breakdown = calculateTaxBreakdown(payoutAmount, isGstRegistered);

  const invoice = await invoiceModel.create({
    connectorId,
    trackId: payoutData.trackId,
    customerName: payoutData.customerName,
    loanType: payoutData.loanType,
    serviceType: payoutData.serviceType,
    processingType: payoutData.processingType,
    loanAmount: payoutData.loanAmount,
    disbursedAmount: payoutData.disbursedAmount,
    payoutAmount,
    sgst: breakdown.sgst,
    cgst: breakdown.cgst,
    tds: breakdown.tds,
    isGstRegistered: breakdown.isGstRegistered,
    grandTotal: breakdown.grandTotal,
    bankName: payoutData.bankName || '',
    trackNumber: payoutData.trackNumber || '',
  });

  return formatInvoice(invoice);
};


const generateCycleInvoice = async (connectorId, payoutData) => {
  // Check if invoice already exists for this payout
  const existing = await invoiceModel.getByTrackId(payoutData.trackId);
  if (existing) {
    return formatInvoice(existing);
  }

  const payoutAmount = parseFloat(payoutData.payoutAmount) || 0;
  const isGstRegistered = payoutData.isGstRegistered === true;
  const breakdown = calculateTaxBreakdown(payoutAmount, isGstRegistered);

  const invoice = await invoiceModel.createCycle({
    connectorId,
    trackId: payoutData.trackId,
    customerName: payoutData.customerName,
    loanType: payoutData.loanType,
    serviceType: payoutData.serviceType,
    processingType: payoutData.processingType,
    loanAmount: payoutData.loanAmount,
    disbursedAmount: payoutData.disbursedAmount,
    payoutAmount,
    sgst: breakdown.sgst,
    cgst: breakdown.cgst,
    tds: breakdown.tds,
    isGstRegistered: breakdown.isGstRegistered,
    grandTotal: breakdown.grandTotal,
    bankName: payoutData.bankName || '',
    trackNumber: payoutData.trackNumber || '',
  });

  return formatInvoice(invoice);
};


const getInvoicesByTrackIds = async (trackIds) => {
  const rows = await invoiceModel.getByTrackIds(trackIds);
  const result = {};
  for (const row of rows) {
    result[row.track_id] = formatInvoice(row);
  }
  return result;
};

/**
 * Format a database invoice row into API response shape.
 */
const formatInvoice = (row) => {
  const fmt = (n) => '₹ ' + parseFloat(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const tds = parseFloat(row.tds || 0);
  const isGstRegistered = row.is_gst_registered === true;

  return {
    invoiceNumber: row.invoice_number,
    trackId: row.track_id,
    customerName: row.customer_name,
    loanType: row.loan_type,
    serviceType: row.service_type,
    processingType: row.processing_type,
    loanAmount: parseFloat(row.loan_amount),
    loanAmountFormatted: fmt(row.loan_amount),
    disbursedAmount: parseFloat(row.disbursed_amount),
    disbursedAmountFormatted: fmt(row.disbursed_amount),
    payoutAmount: parseFloat(row.payout_amount),
    payoutAmountFormatted: fmt(row.payout_amount),
    sgst: parseFloat(row.sgst),
    sgstFormatted: fmt(row.sgst),
    cgst: parseFloat(row.cgst),
    cgstFormatted: fmt(row.cgst),
    tds,
    tdsFormatted: fmt(tds),
    isGstRegistered,
    grandTotal: parseFloat(row.grand_total),
    grandTotalFormatted: fmt(row.grand_total),
    bankName: row.bank_name || '',
    trackNumber: row.track_number || '',
    createdAt: row.created_at,
    dateFormatted: new Date(row.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    }),
  };
};

module.exports = {
  generateInvoice,
  generateCycleInvoice,
  getInvoicesByTrackIds,
};
