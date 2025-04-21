import { settings } from "../config/settings.mjs";
import {
	sendVerifyEmailMessage,
	sendResetPasswordMessage,
} from "../mail/main.mjs";
import { createMailToken } from "./token.mjs";

export async function mailVerifyEmail(request, user) {
	const { protocol, host } = request;

	const token = createMailToken(user, settings.VERIFY_EMAIL_EXPIRY);
	const link = `${protocol}://${host}/auth/session/verify-email/${token}`;
	await sendVerifyEmailMessage(user.email, link);
}

export async function mailResetPassword(request, user) {
	const { protocol, host } = request;

	const token = createMailToken(user, settings.RESET_PASSWORD_EXPIRY);
	const link = `${protocol}://${host}/auth/session/reset-password/${token}`;
	await sendResetPasswordMessage(user.email, link);
}
