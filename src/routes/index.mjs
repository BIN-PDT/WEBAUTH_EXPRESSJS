import { Router } from "express";
import { ErrorHandler } from "../middlewares/error-handler.mjs";
import authRouter from "./auth.mjs";

const router = Router();

router.use("/auth", authRouter);
router.use(ErrorHandler);

export default router;
