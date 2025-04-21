import { Router } from "express";
import { matchedData } from "express-validator";
import { APIResponse } from "../../schemas/api-response.mjs";
import { UserRepository } from "../../repositories/user.mjs";
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
import { createRevokedToken } from "../../utils/token.mjs";
import { mailResetPassword, mailVerifyEmail } from "../../utils/mail.mjs";

export const router = Router();

router.post(
	"/signup",
	UserSignupSchema,
	SchemaValidator,
	async (request, response, next) => {
		const cleanedData = matchedData(request);
		const res = new APIResponse(201);

		try {
			let query;

			query = { username: cleanedData.username };
			if (await UserRepository.findOne(query))
				return res
					.setStatusCode(409)
					.setMessage("Username already in use.")
					.send(response);
			query = { email: cleanedData.email };
			if (await UserRepository.findOne(query))
				return res
					.setStatusCode(409)
					.setMessage("Email already in use.")
					.send(response);

			cleanedData.password = await hashPassword(cleanedData.password);
			const newUser = await UserRepository.create(cleanedData);
			await mailVerifyEmail(request, newUser);

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
		const { body } = request;

		try {
			const query = { email: body.email };
			const user = await UserRepository.findOne(query);
			if (user) await mailResetPassword(request, user);

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

		try {
			await createRevokedToken(payload);

			user.password = await hashPassword(body.password);
			await user.save();

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
	async (request, response, next) => {
		const { user, payload } = request;
		const res = new APIResponse(200);

		if (user.isVerified)
			return res
				.setStatusCode(409)
				.setMessage("Email is verified.")
				.send(response);

		try {
			await createRevokedToken(payload);

			user.isVerified = true;
			await user.save();

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

		await mailVerifyEmail(request, user);

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
			await user.save();

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
			const query = { email: body.email };
			if (await UserRepository.findOne(query))
				return res
					.setStatusCode(409)
					.setMessage("Email already in use.")
					.send(response);

			user.email = body.email;
			user.isVerified = false;
			await user.save();

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
			const query = { _id: user.id };
			const { deletedCount } = await UserRepository.deleteOne(query);
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
