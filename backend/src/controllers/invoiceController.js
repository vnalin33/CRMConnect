const invoiceService = require('../services/invoiceService');
const { createNotification } = require('../models/notificationModel');

/**
 * POST /api/invoices/generate
 * Generate (or retrieve existing) invoice for a payout item.
 */
const generateInvoice = async (req, res, next) => {
  try {
    const connectorId = req.user.id;
    const payoutData = req.body;

    if (!payoutData.trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required' });
    }

    const invoice = await invoiceService.generateInvoice(connectorId, payoutData);

    res.status(200).json({
      success: true,
      data: invoice,
    });

    // Fire-and-forget notification
    createNotification(
      connectorId,
      'Invoice Generated',
      `Invoice #${invoice.invoiceNumber || invoice.invoice_number || ''} generated for Track ID ${payoutData.trackId}.`,
      'INVOICE',
      { trackId: payoutData.trackId, invoiceId: invoice.id }
    ).catch(() => {});
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/invoices/generate-cycle
 * Generate (or retrieve existing) cycle invoice for a payout item.
 * Uses CYC- prefix invoice numbers.
 */
const generateCycleInvoice = async (req, res, next) => {
  try {
    const connectorId = req.user.id;
    const payoutData = req.body;

    if (!payoutData.trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required' });
    }

    const invoice = await invoiceService.generateCycleInvoice(connectorId, payoutData);

    res.status(200).json({
      success: true,
      data: invoice,
    });

    // Fire-and-forget notification
    createNotification(
      connectorId,
      'Cycle Invoice Generated',
      `Cycle Invoice for Track ID ${payoutData.trackId} has been generated.`,
      'INVOICE',
      { trackId: payoutData.trackId, invoiceId: invoice.id }
    ).catch(() => {});
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/invoices/by-tracks
 * Get existing invoices for a list of track IDs.
 * Body: { trackIds: [1, 2, 3] }
 */
const getInvoicesByTrackIds = async (req, res, next) => {
  try {
    const { trackIds } = req.body;

    if (!trackIds || !Array.isArray(trackIds)) {
      return res.status(400).json({ success: false, message: 'trackIds array is required' });
    }

    const invoiceMap = await invoiceService.getInvoicesByTrackIds(trackIds);

    res.status(200).json({
      success: true,
      data: invoiceMap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInvoice,
  generateCycleInvoice,
  getInvoicesByTrackIds,
};
