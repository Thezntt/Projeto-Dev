import Promotion from "../models/promotion-model.js";
import Product from "../models/product-model.js";

const promotionController = {
  // retorna promoções filtradas para o usuário autenticado
  findAll: async (req, res) => {
    try {
      const user = req.user || {};
      const userId = user.id;

      // Build query: match promotions that target the user's preferences or specific userId, or have no specific targets (global)
      let query = {
        $or: [
          { targetUserIds: { $exists: true, $size: 0 } },
          { targetUserIds: { $in: [userId] } },
          { targetPreferences: { $in: user.preferences || [] } },
          { targetPreferences: { $exists: false } },
        ]
      };

      // also ensure promotion is active by date
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };

      const promotions = await Promotion.find(query).populate('productId');

      // Map output to include product details and discount
      const response = promotions.map(p => ({
        _id: p._id,
        product: p.productId,
        discountPercentage: p.discountPercentage,
        startDate: p.startDate,
        endDate: p.endDate
      }));

      res.json(response);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  create: async (req, res) => {
    try {
      const body = req.body || {};

      // required fields
      const required = ['productId', 'discountPercentage', 'startDate', 'endDate'];
      const missing = required.filter(f => !body[f]);
      if (missing.length > 0) {
        return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
      }

      const promotion = await Promotion.create(body);
      res.status(201).json(promotion);
    } catch (err) {
      console.error('Error creating promotion:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body || {};
      const updated = await Promotion.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ message: 'Promotion not found' });
      res.json(updated);
    } catch (err) {
      console.error('Error updating promotion:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const removed = await Promotion.findByIdAndDelete(id);
      if (!removed) return res.status(404).json({ message: 'Promotion not found' });
      res.status(204).json({});
    } catch (err) {
      console.error('Error deleting promotion:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

export default promotionController;
