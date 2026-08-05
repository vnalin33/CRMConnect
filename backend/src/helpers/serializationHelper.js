/**
 * Serialization Helper - Standardizes Express response data
 * Ensures correct data types (numbers, dates, parsed JSON) for admin responses.
 * Ported from Oneassist-CRMConnect backend
 */

function isDate(val) {
  return val instanceof Date && !isNaN(val.valueOf());
}

function serialize(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(serialize);
  }

  if (isDate(obj)) {
    return obj.toISOString();
  }

  if (typeof obj === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'bank_details' && typeof value === 'string') {
        try {
          serialized[key] = serialize(JSON.parse(value));
          continue;
        } catch (e) {
          // Fall back to original if parsing fails
        }
      }

      if (value instanceof Date) {
        serialized[key] = value.toISOString();
        continue;
      }

      const numberKeys = [
        'amount', 'total_amount', 'total_paid_amount', 'total_pending_amount',
        'total_business', 'total_value', 'loanamount', 'sum', 'payout',
        'rate', 'percentage', 'wallet_balance', 'balance', 'paid_amount',
        'approved_amount', 'pending_amount', 'earnings'
      ];
      const intKeys = [
        'total', 'pending', 'approved', 'rejected', 'paid', 'count',
        'total_connects', 'connects', 'conversions', 'activeContacts',
        'pendingPayoutRequests', 'monthlyConnects', 'page', 'limit',
        'pages', 'totalPages', 'unread_count'
      ];

      if (numberKeys.includes(key) && typeof value === 'string') {
        const parsed = parseFloat(value);
        serialized[key] = isNaN(parsed) ? value : parsed;
        continue;
      }

      if (intKeys.includes(key) && typeof value === 'string') {
        const parsed = parseInt(value, 10);
        serialized[key] = isNaN(parsed) ? value : parsed;
        continue;
      }

      serialized[key] = serialize(value);
    }
    return serialized;
  }

  return obj;
}

module.exports = { serialize };
