import Product from "../models/product-model.js";
import User from "../models/user-model.js";

const productController = {
  
  findAll: async (req, res) => {
    try {
      // Avoid noisy logs for anonymous visitors (React StrictMode may mount twice in dev)
      if (req.user && req.user.id) {
        console.log("Tentando buscar produtos para o usuário:", req.user.id);
      }
      // If no authenticated user, return a public product list (no personalized recommendations)
      if (!req.user || !req.user.id) {
        const publicProducts = await Product.find({}, { __v: 0 });
        return res.json(publicProducts);
      }

      // Para admins: listar todos os produtos (painel de administração)
      if (req.user.role === 'admin') {
        const all = await Product.find({}, { __v: 0 });
        return res.json(all);
      }

      // Para usuários comuns: lógica de recomendações por preferências
      const userId = req.user.id;
      const user = await User.findById(userId);
      let responseData = { recommended: [], others: [] };

      if (user && user.preferences && user.preferences.length > 0) {
        responseData.recommended = await Product.find({ category: { $in: user.preferences } });
        responseData.others = await Product.find({ category: { $nin: user.preferences } });
      } else {
        responseData.others = await Product.find();
      }

      res.json(responseData);

    } catch (err) {
      console.error("ERRO GRAVE NO FINDALL:", err);
      res.status(500).json({ error: "Erro interno ao buscar produtos. Veja o terminal." });
    }
  },

  create: async (req, res) => {
    try {
      const { name, price, category, description, expirationDate } = req.body;
      // if multer stored a file, build public path
      let image = undefined;
      if (req.file && req.file.filename) {
        image = `/uploads/${req.file.filename}`;
      } else if (req.body.image) {
        image = req.body.image;
      }


      if (!name || !price || !category) {
        return res.status(400).json({ error: "Nome, preço e categoria são obrigatórios" });
      }

      const newProduct = await Product.create({
        name,
        price,
        category,
        description,
        expirationDate,
        image
      });

      res.status(201).json(newProduct);
      
    } catch (err) {
      console.error("ERRO AO CRIAR PRODUTO:", err);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  }
};

// delete product by id (admin only)
productController.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error('ERRO AO DELETAR PRODUTO:', err);
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};

export default productController;

// update product by id (admin only)
productController.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, price, category, description, expirationDate } = req.body;

    // determine image: uploaded file or provided URL
    let image = undefined;
    if (req.file && req.file.filename) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (price !== undefined) updateObj.price = price;
    if (category !== undefined) updateObj.category = category;
    if (description !== undefined) updateObj.description = description;
    if (expirationDate !== undefined) updateObj.expirationDate = expirationDate;
    if (image !== undefined) updateObj.image = image;

    const updated = await Product.findByIdAndUpdate(id, updateObj, { new: true });
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(updated);
  } catch (err) {
    console.error('ERRO AO ATUALIZAR PRODUTO:', err);
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};