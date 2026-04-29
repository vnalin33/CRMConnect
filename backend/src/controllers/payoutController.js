const payoutService = require('../services/payoutService');

/**
 * GET /api/payouts — Fetch all payout records for the logged-in connector
 */
const getPayouts = async (req, res, next) => {
  try {
    const connectorId = req.user.id;
    const result = await payoutService.getPayouts(connectorId);

    res.status(200).json({
      success: true,
      data: result.payouts,
      summary: result.summary,
      count: result.payouts.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayouts,
};
