import { Router } from "express";
import { router as authSessionRouter } from "./auth-session.mjs";
import { router as authJWTRouter } from "./auth-jwt.mjs";
import { router as authGoogleRouter } from "./auth-google.mjs";

export const router = Router();

router.use("/session", authSessionRouter);
router.use("/jwt", authJWTRouter);
router.use("/google", authGoogleRouter);
