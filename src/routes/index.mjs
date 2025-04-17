import { Router } from "express";
import ErrorHanlder from "../middlewares/error-handler.mjs";
import authRouter from "./auth.mjs";

const router = Router();

router.use("/auth", authRouter);
router.use(ErrorHanlder);

export default router;
