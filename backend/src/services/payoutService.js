const payoutModel = require('../models/payoutModel');

const calculatePayoutPercent = (loanType, serviceType, processingType, disbursedAmount) => {
  const d = parseFloat(disbursedAmount) || 0;
  const lt = (loanType || '').toLowerCase();
  const st = (serviceType || 'end to end').toLowerCase();
  const pt = (processingType || 'cycle').toLowerCase();

  if (pt === 'cycle') {
    if (st === 'end to end') {
      if (lt.includes('personal')) {
        if (d <= 2500000) return 1.0;
        if (d <= 5000000) return 1.20;
        if (d <= 10000000) return 1.50;
        if (d <= 20000000) return 2.0;
        return 2.50;
      } else if (lt.includes('business')) {
        if (d <= 2500000) return 1.25;
        if (d <= 5000000) return 1.45;
        if (d <= 10000000) return 1.75;
        if (d <= 20000000) return 2.25;
        return 2.75;
      } else if (lt.includes('home')) {
        if (d <= 4500000) return 0.25;
        if (d <= 7500000) return 0.30;
        if (d <= 15000000) return 0.40;
        if (d <= 30000000) return 0.50;
        return 0.70;
      } else if (lt.includes('property') || lt.includes('lap')) {
        if (d <= 4500000) return 0.35;
        if (d <= 7500000) return 0.50;
        if (d <= 15000000) return 0.60;
        if (d <= 30000000) return 0.75;
        return 1.0;
      }
    } else if (st === 'converted leads only') {
      if (lt.includes('personal')) {
        if (d <= 2500000) return 0.80;
        if (d <= 5000000) return 1.0;
        if (d <= 10000000) return 1.30;
        if (d <= 20000000) return 1.80;
        return 2.30;
      } else if (lt.includes('business')) {
        if (d <= 2500000) return 0.05;
        if (d <= 5000000) return 1.25;
        if (d <= 10000000) return 1.55;
        if (d <= 20000000) return 2.20;
        return 2.55;
      } else if (lt.includes('home')) {
        if (d <= 4500000) return 0.15;
        if (d <= 7500000) return 0.20;
        if (d <= 15000000) return 0.30;
        if (d <= 30000000) return 0.40;
        return 0.50;
      } else if (lt.includes('property') || lt.includes('lap')) {
        if (d <= 4500000) return 0.25;
        if (d <= 7500000) return 0.40;
        if (d <= 15000000) return 0.50;
        if (d <= 30000000) return 0.65;
        return 0.90;
      }
    }
  }

  // ── INSTANT processing type ──
  if (pt === 'instant') {
    if (st === 'end to end') {
      if (lt.includes('personal')) {
        if (d <= 2500000) return 0.80;
        if (d <= 5000000) return 1.0;
        if (d <= 10000000) return 1.30;
        if (d <= 20000000) return 1.80;
        return 2.30;
      } else if (lt.includes('business')) {
        if (d <= 2500000) return 1.05;
        if (d <= 5000000) return 1.30;
        if (d <= 10000000) return 1.55;
        if (d <= 20000000) return 2.05;
        return 2.55;
      } else if (lt.includes('home')) {
        if (d <= 4500000) return 0.05;
        if (d <= 7500000) return 0.10;
        if (d <= 15000000) return 0.20;
        if (d <= 30000000) return 0.30;
        return 0.50;
      } else if (lt.includes('property') || lt.includes('lap')) {
        if (d <= 4500000) return 0.15;
        if (d <= 7500000) return 0.30;
        if (d <= 15000000) return 0.40;
        if (d <= 30000000) return 0.55;
        return 0.80;
      }
    } else if (st === 'converted leads only') {
      if (lt.includes('personal')) {
        if (d <= 2500000) return 0.60;
        if (d <= 5000000) return 0.80;
        if (d <= 10000000) return 1.20;
        if (d <= 20000000) return 1.60;
        return 2.10;
      } else if (lt.includes('business')) {
        if (d <= 2500000) return 0.85;
        if (d <= 5000000) return 1.05;
        if (d <= 10000000) return 1.35;
        if (d <= 20000000) return 2.0;
        return 2.35;
      } else if (lt.includes('home')) {
        if (d <= 4500000) return 0.05;
        if (d <= 7500000) return 0.10;
        if (d <= 15000000) return 0.20;
        if (d <= 30000000) return 0.30;
        return 0.40;
      } else if (lt.includes('property') || lt.includes('lap')) {
        if (d <= 4500000) return 0.15;
        if (d <= 7500000) return 0.30;
        if (d <= 15000000) return 0.40;
        if (d <= 30000000) return 0.65;
        return 0.80;
      }
    }
  }

  // Fallback to database value if neither condition is met
  return null;
};

const formatPayoutRow = (row) => {
  const disbursedRaw = parseFloat(row.disbursementamount) || 0;
  const loanAmountRaw = parseFloat(row.loan_amount) || 0;
  const amountToCalculate = disbursedRaw > 0 ? disbursedRaw : loanAmountRaw;

  let payoutPercent = calculatePayoutPercent(row.loan_type, row.servicetype, row.processingtype, amountToCalculate);
  if (payoutPercent === null) {
    payoutPercent = parseFloat(row.payoutpercent) || 0;
  } else if (parseFloat(row.payoutpercent) !== payoutPercent) {
    // Auto-mate the process: Save calculated percent back to DB so Web CRM sees it
    payoutModel.updatePayoutPercent(row.track_id, payoutPercent).catch(err =>
      console.error(`Failed to auto-update payout percent for track ${row.track_id}:`, err)
    );
  }

  const payoutRaw = Math.round(amountToCalculate * payoutPercent / 100);

  return {
    id: row.track_id.toString(),
    leadId: row.lead_id,
    name: row.customer_name || 'Unknown',
    loanType: row.loan_type || 'N/A',
    serviceType: row.servicetype || 'N/A',
    processingType: row.processingtype || 'N/A',
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

const getPayouts = async (connectorId) => {
  const rawPayouts = await payoutModel.getPayoutsByConnector(connectorId);
  const payouts = rawPayouts.map(formatPayoutRow);

  let totalDisbursed = 0;
  let paidAmount = 0;
  let pendingAmount = 0;
  let paidCount = 0;
  let pendingCount = 0;

  for (const p of payouts) {
    totalDisbursed += p.disbursedAmount;
    if (p.status === 'paid') {
      paidCount++;
      paidAmount += p.payoutAmount;
    } else {
      pendingCount++;
      pendingAmount += p.payoutAmount;
    }
  }

  return {
    payouts,
    summary: {
      totalCount: payouts.length,
      totalDisbursed: totalDisbursed,
      totalDisbursedFormatted: `₹${totalDisbursed.toLocaleString('en-IN')}`,
      paidCount: paidCount,
      paidAmount: paidAmount,
      paidAmountFormatted: `₹${paidAmount.toLocaleString('en-IN')}`,
      pendingCount: pendingCount,
      pendingAmount: pendingAmount,
      pendingAmountFormatted: `₹${pendingAmount.toLocaleString('en-IN')}`,
    },
  };
};

module.exports = {
  getPayouts,
  calculatePayoutPercent,
};
