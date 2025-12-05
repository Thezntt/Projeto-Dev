import Product from "../models/product-model.js";
import User from "../models/user-model.js";

const productController = {
  
  findAll: async (req, res) => {
    try {
      console.log("Tentando buscar produtos para o usuário:", req.user);

      if (!req.user || !req.user.id) {
        console.error("ERRO: req.user não existe. Verifique a ordem do 'app.use' no server.js");
        return res.status(401).json({ error: "Usuário não autenticado corretamente." });
      }

      const userId = req.user.id;
      
      const user = await User.findById(userId);
      
      let responseData = {
        recommended: [],
        others: []
      };

      if (user && user.preferences && user.preferences.length > 0) {
        console.log(`Usuário tem preferências: ${user.preferences}`);

        responseData.recommended = await Product.find({ 
            category: { $in: user.preferences } 
        });
        
        responseData.others = await Product.find({
            category: { $nin: user.preferences }
        });

      } else {
        console.log("Usuário sem preferências ou histórico.");
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


      if (!name || !price || !category) {
        return res.status(400).json({ error: "Nome, preço e categoria são obrigatórios" });
      }

      const newProduct = await Product.create({
        name, 
        price, 
        category, 
        description, 
        expirationDate
      });

      res.status(201).json(newProduct);
      
    } catch (err) {
      console.error("ERRO AO CRIAR PRODUTO:", err);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  }
};

export default productController;