const db = require('../config/db');

/**
 * Get all payout records for a connector.
 * Joins leadtrackdetails + leadpersonaldetails to fetch
 * disbursement amounts, loan details, dates, and payout status.
 *
 * Only leads with status >= 17 (Disbursement) are considered payouts.
 */
const getPayoutsByConnector = async (connectorId) => {
  const query = `
    SELECT
      lt.id              AS track_id,
      lp.id              AS lead_id,
      COALESCE(lt.customername, TRIM(CONCAT(lp.firstname, ' ', lp.lastname))) AS customer_name,
      COALESCE(lt.loantype, lp.loantype)       AS loan_type,
      COALESCE(lt.desireloanamount, lp.loanamount::text)  AS loan_amount,
      lt.disbursementamount,
      lt.sanctionvalue,
      lt.sanctiondate,
      lt.loginvalue,
      lt.logindate,
      lt.bankname,
      lt.applicationnumber,
      lt.payoutpercent,
      lt.ispaid,
      lt.status           AS track_status,
      lt.modifyon          AS disbursement_date,
      lp.createdon         AS lead_created,
      lt.tracknumber
    FROM leadtrackdetails lt
    INNER JOIN leadpersonaldetails lp ON lp.id = lt.leadid
    WHERE lp.connectorid = $1
      AND lt.status >= 17
    ORDER BY lt.modifyon DESC
  `;
  const { rows } = await db.query(query, [connectorId]);
  return rows;
};

/**
 * Get payout summary statistics for a connector.
 */
const getPayoutSummary = async (connectorId) => {
  const query = `
    SELECT
      COUNT(*)::int                                                    AS total_count,
      COALESCE(SUM(CASE WHEN lt.ispaid = true THEN 1 ELSE 0 END), 0)::int  AS paid_count,
      COALESCE(SUM(CASE WHEN lt.ispaid = false OR lt.ispaid IS NULL THEN 1 ELSE 0 END), 0)::int AS pending_count,
      COALESCE(SUM(
        CASE WHEN lt.disbursementamount ~ '^[0-9]+(\\.[0-9]+)?$'
        THEN lt.disbursementamount::numeric ELSE 0 END
      ), 0)::numeric                                                     AS total_disbursed,
      COALESCE(SUM(
        CASE WHEN lt.ispaid = true AND lt.disbursementamount ~ '^[0-9]+(\\.[0-9]+)?$'
        THEN lt.disbursementamount::numeric ELSE 0 END
      ), 0)::numeric                                                     AS paid_amount,
      COALESCE(SUM(
        CASE WHEN (lt.ispaid = false OR lt.ispaid IS NULL) AND lt.disbursementamount ~ '^[0-9]+(\\.[0-9]+)?$'
        THEN lt.disbursementamount::numeric ELSE 0 END
      ), 0)::numeric                                                     AS pending_amount
    FROM leadtrackdetails lt
    INNER JOIN leadpersonaldetails lp ON lp.id = lt.leadid
    WHERE lp.connectorid = $1
      AND lt.status >= 17
  `;
  const { rows } = await db.query(query, [connectorId]);
  return rows[0] || {
    total_count: 0,
    paid_count: 0,
    pending_count: 0,
    total_disbursed: 0,
    paid_amount: 0,
    pending_amount: 0,
  };
};

module.exports = {
  getPayoutsByConnector,
  getPayoutSummary,
};
