import express from "express";
import userController from "../controllers/user-controller.js";
import authMiddleware from "../auth-middleware.js";


const router = express.Router();

router.route("/:email")
.delete(userController.delete)
.get(userController.getOne)
.put(userController.update);

router.route("/")
.get(authMiddleware, userController.findAll) // Adiciona middleware de autenticação
.post(userController.create);

router.route("/login")
.post(userController.login);

router.route("/signup")
.post(userController.create);

export default router;