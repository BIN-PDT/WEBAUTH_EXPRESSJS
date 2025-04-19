import { settings } from "../config/settings.mjs";
import { sendSignupMessage } from "../mail/mailer.mjs";
import { createMailToken } from "./jwt.mjs";

export async function sendEmailVerification(request, user) {
	const { protocol, host } = request;

	const token = createMailToken(user, settings.VERIFY_EMAIL_EXPIRY);
	const link = `${protocol}://${host}/auth/verify-email/${token}`;
	await sendSignupMessage(user.email, link);
}
