import { Router } from "express";
import authRouter from "./auth.mjs";

const router = Router();

router.use("/auth", authRouter);

export default router;
