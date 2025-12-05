import express from "express";
import userController from "../controllers/user-controller.js";


const router = express.Router();

router.route("/:email")
.delete(userController.delete)
.get(userController.getOne)
.put(userController.update);

router.route("/")
.get(userController.findAll)
.post(userController.create);

router.route("/login")
.post(userController.login);

router.route("/signup")
.post(userController.create);

export default router;