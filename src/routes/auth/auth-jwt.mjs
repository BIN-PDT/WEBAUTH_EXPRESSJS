import { Router } from "express";
import { APIResponse } from "../../schemas/api-response.mjs";
import { JWTAuth, JWTLocalAuth } from "../../middlewares/auth/jwt-auth.mjs";
import { TokenRefreshSchema } from "../../schemas/token-refresh.mjs";
import { SchemaValidator } from "../../middlewares/schema-validator.mjs";
import { RefreshTokenValidator } from "../../middlewares/token-validator.mjs";
import { createTokenPair, revokeToken } from "../../utils/jwt.mjs";

export const router = Router();

router.post("/signin", JWTLocalAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get("/signout", JWTAuth, async (request, response, next) => {
	const { payload } = request;

	const { error } = await revokeToken(payload);
	if (error) return next(error);

	return new APIResponse(200)
		.setMessage("Signed out successfully.")
		.send(response);
});

router.post(
	"/refresh",
	JWTAuth,
	TokenRefreshSchema,
	SchemaValidator,
	RefreshTokenValidator,
	(request, response, next) => {
		const { user, payload: accessPayload } = request;

		const { error } = revokeToken(accessPayload);
		if (error) return next(error);

		const tokenPair = createTokenPair(user);
		return new APIResponse(200)
			.setMessage("Refreshed tokens successfully.")
			.setData(tokenPair)
			.send(response);
	}
);
