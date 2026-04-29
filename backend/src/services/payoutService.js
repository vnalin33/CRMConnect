const payoutModel = require('../models/payoutModel');

/**
 * Compute payout amount from disbursement amount and payout percent.
 * payoutPercent is stored as a string like "1", "1.5", etc.
 */
const computePayoutAmount = (disbursementAmount, payoutPercent) => {
  const disbursed = parseFloat(disbursementAmount) || 0;
  const percent = parseFloat(payoutPercent) || 0;
  return Math.round(disbursed * percent / 100);
};

/**
 * Format a payout row into a clean response object.
 */
const formatPayoutRow = (row) => {
  const disbursedRaw = parseFloat(row.disbursementamount) || 0;
  const loanAmountRaw = parseFloat(row.loan_amount) || 0;
  const payoutPercent = parseFloat(row.payoutpercent) || 0;
  const payoutRaw = computePayoutAmount(row.disbursementamount, row.payoutpercent);

  return {
    id: row.track_id.toString(),
    leadId: row.lead_id,
    name: row.customer_name || 'Unknown',
    loanType: row.loan_type || 'N/A',
    loanAmount: loanAmountRaw,
    loanAmountFormatted: `₹${loanAmountRaw.toLocaleString('en-IN')}`,
    disbursedAmount: disbursedRaw,
    disbursedAmountFormatted: `₹${disbursedRaw.toLocaleString('en-IN')}`,
    payoutPercent: payoutPercent,
    payoutAmount: payoutRaw,
    payoutAmountFormatted: `₹${payoutRaw.toLocaleString('en-IN')}`,
    status: row.ispaid ? 'paid' : 'pending',
    bankName: row.bankname || '',
    applicationNumber: row.applicationnumber || '',
    sanctionValue: parseFloat(row.sanctionvalue) || 0,
    trackNumber: row.tracknumber || '',
    date: row.disbursement_date
      ? new Date(row.disbursement_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    dateRaw: row.disbursement_date || null,
    leadCreated: row.lead_created
      ? new Date(row.lead_created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
  };
};

/**
 * Get all payouts for a connector with formatted data + summary.
 */
const getPayouts = async (connectorId) => {
  const [rawPayouts, summary] = await Promise.all([
    payoutModel.getPayoutsByConnector(connectorId),
    payoutModel.getPayoutSummary(connectorId),
  ]);

  const payouts = rawPayouts.map(formatPayoutRow);

  return {
    payouts,
    summary: {
      totalCount: summary.total_count,
      totalDisbursed: parseFloat(summary.total_disbursed) || 0,
      totalDisbursedFormatted: `₹${(parseFloat(summary.total_disbursed) || 0).toLocaleString('en-IN')}`,
      paidCount: summary.paid_count,
      paidAmount: parseFloat(summary.paid_amount) || 0,
      paidAmountFormatted: `₹${(parseFloat(summary.paid_amount) || 0).toLocaleString('en-IN')}`,
      pendingCount: summary.pending_count,
      pendingAmount: parseFloat(summary.pending_amount) || 0,
      pendingAmountFormatted: `₹${(parseFloat(summary.pending_amount) || 0).toLocaleString('en-IN')}`,
    },
  };
};

module.exports = {
  getPayouts,
};
