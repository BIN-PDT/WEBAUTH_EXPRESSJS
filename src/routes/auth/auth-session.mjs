import { Router } from "express";
import { matchedData } from "express-validator";
import { settings } from "../../config/settings.mjs";
import { APIResponse } from "../../schemas/api-response.mjs";
import { User } from "../../models/user.mjs";
import { SessionLocalAuth } from "../../middlewares/auth/session-auth.mjs";
import { UserSignupSchema } from "../../schemas/user-signup.mjs";
import { MailTokenSchema } from "../../schemas/mail-token.mjs";
import {
	PasswordResetRequestSchema,
	PasswordResetConfirmSchema,
} from "../../schemas/password-reset.mjs";
import { PasswordChangeSchema } from "../../schemas/password-change.mjs";
import { EmailChangeSchema } from "../../schemas/email-change.mjs";
import {
	SignedInValidator,
	SignedOutValidator,
} from "../../middlewares/session-validator.mjs";
import { LocalUserValidator } from "../../middlewares/user-validator.mjs";
import { SchemaValidator } from "../../middlewares/schema-validator.mjs";
import { MailTokenValidator } from "../../middlewares/token-validator.mjs";
import { comparePassword, hashPassword } from "../../utils/password.mjs";
import { createMailToken, revokeToken } from "../../utils/jwt.mjs";
import { sendResetPasswordMessage } from "../../mail/main.mjs";
import { sendEmailVerification } from "../../utils/mail.mjs";

export const router = Router();

router.post(
	"/signup",
	UserSignupSchema,
	SchemaValidator,
	async (request, response, next) => {
		const cleanedData = matchedData(request);
		const res = new APIResponse(201);

		try {
			if (await User.findOne({ username: cleanedData.username }))
				return res
					.setStatusCode(409)
					.setMessage("Username already in use.")
					.send(response);
			if (await User.findOne({ email: cleanedData.email }))
				return res
					.setStatusCode(409)
					.setMessage("Email already in use.")
					.send(response);

			cleanedData.password = await hashPassword(cleanedData.password);
			const newUser = await User.create(cleanedData);
			await sendEmailVerification(request, newUser);

			return res
				.setMessage("Signed up successfully.")
				.setData(newUser)
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

router.get(
	"/signout",
	SignedInValidator,
	LocalUserValidator,
	(request, response, next) => {
		request.logOut((error) => {
			if (error) return next(error);

			return new APIResponse(200)
				.setMessage("Signed out successfully.")
				.send(response);
		});
	}
);

router.post(
	"/reset-password",
	PasswordResetRequestSchema,
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

router.patch(
	"/reset-password/:token",
	PasswordResetConfirmSchema,
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

router.patch(
	"/verify-email/:token",
	MailTokenSchema,
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

router.get(
	"/verify-email/send",
	SignedInValidator,
	LocalUserValidator,
	async (request, response) => {
		const { user } = request;
		const res = new APIResponse(200);

		if (user.isVerified)
			return res
				.setStatusCode(409)
				.setMessage("Email is verified.")
				.send(response);

		await sendEmailVerification(request, user);

		return res
			.setMessage("Sended verification email successfully.")
			.send(response);
	}
);

router.patch(
	"/change-password",
	SignedInValidator,
	LocalUserValidator,
	PasswordChangeSchema,
	SchemaValidator,
	async (request, response, next) => {
		const { body, user } = request;
		const res = new APIResponse(200);

		if (!(await comparePassword(body.oldPassword, user.password)))
			return res
				.setStatusCode(400)
				.setMessage("Wrong current password.")
				.send(response);

		user.password = await hashPassword(body.password);
		try {
			user.save();

			return res
				.setMessage("Changed password successfully.")
				.send(response);
		} catch (error) {
			next(error);
		}
	}
);

router.patch(
	"/change-email",
	SignedInValidator,
	LocalUserValidator,
	EmailChangeSchema,
	SchemaValidator,
	async (request, response, next) => {
		const { body, user } = request;
		const res = new APIResponse(200);

		try {
			if (await User.findOne({ email: body.email }))
				return res
					.setStatusCode(409)
					.setMessage("Email already in use.")
					.send(response);

			user.email = body.email;
			user.isVerified = false;
			user.save();

			return res.setMessage("Changed email successfully.").send(response);
		} catch (error) {
			next(error);
		}
	}
);

router.delete(
	"/delete-account",
	SignedInValidator,
	async (request, response, next) => {
		const { user } = request;
		const res = new APIResponse(200);

		try {
			const { deletedCount } = await User.deleteOne({ _id: user.id });
			if (deletedCount == 0)
				return res
					.setStatusCode(404)
					.setMessage("User not found.")
					.send(response);
		} catch (error) {
			next(error);
		}

		request.logOut((error) => {
			if (error) return next(error);

			return res
				.setMessage("Deleted account successfully.")
				.setData(user)
				.send(response);
		});
	}
);
