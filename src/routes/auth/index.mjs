import { Router } from "express";
import { router as authLocalRouter } from "./auth-local.mjs";
import { router as authJWTRouter } from "./auth-jwt.mjs";
import { router as authGoogleRouter } from "./auth-google.mjs";

export const router = Router();

router.use("/", authLocalRouter);
router.use("/jwt", authJWTRouter);
router.use("/google", authGoogleRouter);
