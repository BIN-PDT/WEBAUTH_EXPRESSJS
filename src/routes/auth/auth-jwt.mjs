import { Router } from "express";
import { APIResponse } from "../../schemas/api-response.mjs";
import { JWTAuth, JWTLocalAuth } from "../../middlewares/auth/jwt-auth.mjs";
import { TokenRefreshSchema } from "../../schemas/token-refresh.mjs";
import { SchemaValidator } from "../../middlewares/schema-validator.mjs";
import { RefreshTokenValidator } from "../../middlewares/token-validator.mjs";
import { createAuthToken, createRevokedToken } from "../../utils/token.mjs";

export const router = Router();

router.post("/signin", JWTLocalAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get("/signout", JWTAuth, (request, response, next) => {
	const { payload } = request;

	createRevokedToken(payload)
		.then((_) =>
			new APIResponse(200)
				.setMessage("Signed out successfully.")
				.send(response)
		)
		.catch((error) => next(error));
});

router.post(
	"/refresh",
	JWTAuth,
	TokenRefreshSchema,
	SchemaValidator,
	RefreshTokenValidator,
	(request, response, next) => {
		const { user, payload } = request;

		createRevokedToken(payload)
			.then((_) => {
				const tokenPair = createAuthToken(user);
				return new APIResponse(200)
					.setMessage("Refreshed tokens successfully.")
					.setData(tokenPair)
					.send(response);
			})
			.catch((error) => next(error));
	}
);
