import { Router } from "express";
import { matchedData } from "express-validator";
import { settings } from "../config/settings.mjs";
import { APIResponse } from "../schemas/api-response.mjs";
import { UserSignupSchemaValidation } from "../schemas/user-signup.mjs";
import { TokenRefreshSchemaValidation } from "../schemas/token-refresh.mjs";
import { MailTokenSchemaValidation } from "../schemas/mail-token.mjs";
import { SchemaValidator } from "../middlewares/schema-validator.mjs";
import { RefreshTokenValidator } from "../middlewares/refresh-token-validator.mjs";
import {
	SignedInValidator,
	SignedOutValidator,
} from "../middlewares/session-validator.mjs";
import { MailTokenValidator } from "../middlewares/mail-token-validator.mjs";
import { SessionLocalAuth, JWTLocalAuth } from "../middlewares/local-auth.mjs";
import { JWTAuth } from "../middlewares/jwt-auth.mjs";
import { GoogleLocalAuth, GoogleAuth } from "../middlewares/google-auth.mjs";
import { User } from "../models/user.mjs";
import { hashPassword } from "../utils/password.mjs";
import {
	createTokenPair,
	createMailToken,
	revokeToken,
} from "../utils/jwt.mjs";
import { sendSignupMessage } from "../mail/mailer.mjs";

const router = Router();

router.post(
	"/signup",
	UserSignupSchemaValidation,
	SchemaValidator,
	async (request, response, next) => {
		const { protocol, host } = request;
		const cleanedData = matchedData(request);
		const res = new APIResponse(201);

		try {
			if (await User.findOne({ username: cleanedData.username }))
				return res
					.setStatusCode(409)
					.setMessage("Username already in use.")
					.send(response);

			cleanedData.password = await hashPassword(cleanedData.password);
			const newUser = await User.create(cleanedData);

			const token = createMailToken(
				newUser,
				settings.VERIFY_EMAIL_EXPIRY
			);
			const link = `${protocol}://${host}/auth/verify-email/${token}`;
			await sendSignupMessage(newUser.email, link);

			return res
				.setMessage("Signed up successfully.")
				.setData(newUser)
				.send(response);
		} catch (error) {
			next(error);
		}
	}
);

router.get(
	"/verify-email/:token",
	MailTokenSchemaValidation,
	SchemaValidator,
	MailTokenValidator,
	(request, response, next) => {
		const { user } = request;
		const res = new APIResponse(200);

		if (user.isVerified)
			return res
				.setStatusCode(409)
				.setMessage("Email is verified.")
				.send(response);

		user.isVerified = true;
		try {
			user.save();
			return res
				.setMessage("Verified email successfully.")
				.send(response);
		} catch (error) {
			next(error);
		}
	}
);

router.post(
	"/signin",
	SignedOutValidator,
	SessionLocalAuth,
	(request, response) => {
		return new APIResponse(200)
			.setMessage("Signed in successfully.")
			.setData(request.user)
			.send(response);
	}
);

router.get("/signout", SignedInValidator, (request, response, next) => {
	request.logOut((error) => {
		if (error) return next(error);
		return new APIResponse(200)
			.setMessage("Signed out successfully.")
			.send(response);
	});
});

router.post("/jwt/signin", JWTLocalAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get("/jwt/signout", JWTAuth, async (request, response, next) => {
	const { payload } = request;

	const { error } = await revokeToken(payload);
	if (error) return next(error);
	return new APIResponse(200)
		.setMessage("Signed out successfully.")
		.send(response);
});

router.post(
	"/jwt/refresh",
	JWTAuth,
	TokenRefreshSchemaValidation,
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

router.get("/google/signin", SignedOutValidator, GoogleLocalAuth);

router.get(
	"/google/callback",
	SignedOutValidator,
	GoogleAuth,
	(request, response) => {
		return new APIResponse(200)
			.setMessage("Signed in successfully.")
			.setData(request.user)
			.send(response);
	}
);

router.get("/google/signout", SignedInValidator, (request, response, next) => {
	request.logOut((error) => {
		if (error) return next(error);
		return new APIResponse(200)
			.setMessage("Signed out successfully.")
			.send(response);
	});
});

export default router;
