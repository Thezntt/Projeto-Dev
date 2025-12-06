import userModel from "../models/user-model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Validação de CPF (algoritmo comum)
function validateCPF(cpf) {
    if (!cpf) return false;
    const onlyDigits = cpf.replace(/\D/g, "");
    if (onlyDigits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(onlyDigits)) return false; // todos iguais

    const digits = onlyDigits.split("").map(Number);

    const calc = (slice) => {
        let sum = 0;
        for (let i = 0; i < slice.length; i++) {
            sum += slice[i] * (slice.length + 1 - i);
        }
        const res = sum % 11;
        return res < 2 ? 0 : 11 - res;
    };

    const d1 = calc(digits.slice(0, 9));
    const d2 = calc(digits.slice(0, 10));

    return d1 === digits[9] && d2 === digits[10];
}

const controller = {
    delete: async function (req, res) {
        try{
            const result = await userModel.findOneAndDelete({email: req.params.email});

            if (!result) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(204).json(result);

        } catch (err) {
            res.status(500).json({message: "Internal Server Error"});
        }       
    },

    getOne: async function (req, res) {
        try {
            const result = await userModel.findOne({email: req.params.email}, {__v: false, _id: false});
            if (!result) {
                return res.status(404).json({ message: "User not found" });
            }
            const user = result.toObject();
            delete user.password;
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({message: "Internal Server Error"});
        }
    },

    update: async function (req, res) {
        try {
            const updateData = { ...req.body };

            // Se for trocar senha, criptografa antes
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            // Se CPF fornecido, valida
            if (updateData.cpf && !validateCPF(updateData.cpf)) {
                return res.status(400).json({ message: "CPF inválido" });
            }

            const result = await userModel.findOneAndUpdate({ email: req.params.email }, updateData, { new: true, runValidators: true });

            if (!result) {
                return res.status(404).json({ message: "User not found" });
            }

            const obj = result.toObject();
            delete obj.password;
            res.status(200).json(obj);

        } catch (err) {
            res.status(500).json({message: "Internal Server Error"});
        }       
    },

    create: async function (req, res) {
        try {
            const user = req.body || {};

            // checar campos obrigatórios antes de tentar criar
            const required = ["username", "email", "password", "cpf"];
            const missing = required.filter((f) => !user[f]);
            if (missing.length > 0) {
                return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
            }

            // valida CPF
            if (!validateCPF(user.cpf)) {
                return res.status(400).json({ message: "CPF inválido" });
            }

            const encryptedPassword = await bcrypt.hash(user.password, 10);
            user.password = encryptedPassword;

            const result = await userModel.create(user);
            // não devolver senha na resposta
            const obj = result.toObject();
            delete obj.password;
            res.status(201).json(obj);
        } catch (err) {
            // Tratamento de erros comuns do Mongoose
            if (err.name === 'ValidationError') {
                return res.status(400).json({ message: err.message });
            }
            // Erro de chave duplicada (e.g., email ou cpf únicos)
            if (err.code === 11000) {
                const key = Object.keys(err.keyValue || {}).join(', ');
                return res.status(400).json({ message: `Duplicate key error: ${key}` });
            }

            console.error('Error creating user:', err);
            res.status(500).json({message: "Internal Server Error"});
        }
       
    },

    findAll: async function (req, res) {
        const result = await userModel.find({}, { __v: false, password: 0 }); // Exclui password
        res.status(200).json(result.map(u => {
            const obj = u.toObject(); delete obj.password; return obj;
        }));
    },

    login: async function (req, res) {
    try {
        const result = await userModel.findOne({email: req.body.email});

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.toObject();

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: result._id.toString(), email: user.email, role: user.role }, // Inclui o papel do usuário no token
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            role: user.role // Retorna o papel do usuário na resposta
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
}

export default controller;