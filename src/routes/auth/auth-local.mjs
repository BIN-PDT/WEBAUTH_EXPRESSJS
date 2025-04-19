import { Router } from "express";
import { matchedData } from "express-validator";
import { settings } from "../../config/settings.mjs";
import { APIResponse } from "../../schemas/api-response.mjs";
import { User } from "../../models/user.mjs";
import { SessionLocalAuth } from "../../middlewares/local-auth.mjs";
import { UserSignupSchemaValidation } from "../../schemas/user-signup.mjs";
import { MailTokenSchemaValidation } from "../../schemas/mail-token.mjs";
import {
	PasswordResetRequestSchemaValidation,
	PasswordResetConfirmSchemaValidation,
} from "../../schemas/password-reset.mjs";
import {
	SignedInValidator,
	SignedOutValidator,
} from "../../middlewares/session-validator.mjs";
import { SchemaValidator } from "../../middlewares/schema-validator.mjs";
import { MailTokenValidator } from "../../middlewares/mail-token-validator.mjs";
import { hashPassword } from "../../utils/password.mjs";
import { createMailToken, revokeToken } from "../../utils/jwt.mjs";
import {
	sendSignupMessage,
	sendResetPasswordMessage,
} from "../../mail/mailer.mjs";

export const router = Router();

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

router.post(
	"/request-reset-password",
	PasswordResetRequestSchemaValidation,
	SchemaValidator,
	async (request, response, next) => {
		const { protocol, host, body } = request;

		try {
			const user = await User.findOne({ email: body.email });
			if (user) {
				const token = createMailToken(
					user,
					settings.RESET_PASSWORD_EXPIRY
				);
				const link = `${protocol}://${host}/auth/confirm-reset-password/${token}`;
				await sendResetPasswordMessage(user.email, link);
			}

			return new APIResponse(200)
				.setMessage("Requested password reset successfully.")
				.send(response);
		} catch (error) {
			next(error);
		}
	}
);

router.post(
	"/confirm-reset-password/:token",
	PasswordResetConfirmSchemaValidation,
	SchemaValidator,
	MailTokenValidator,
	async (request, response, next) => {
		const { body, user, payload } = request;

		const { error } = await revokeToken(payload);
		if (error) return next(error);

		user.password = await hashPassword(body.password);
		try {
			user.save();

			return new APIResponse(200)
				.setMessage("Confirmed password reset successfully.")
				.send(response);
		} catch (error) {
			next(error);
		}
	}
);
