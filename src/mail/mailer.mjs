import { settings } from "../config/settings.mjs";
import { transporter } from "./config.mjs";
import { getResetPasswordHTML, getSignupHTML } from "./templates.mjs";

function sendMessage(receiver, subject, content) {
	return transporter.sendMail({
		from: settings.MAIL_FROM,
		to: receiver,
		subject: subject,
		html: content,
	});
}

export function sendSignupMessage(receiver, link) {
	const html = getSignupHTML(link);
	return sendMessage(receiver, "Verify Email", html);
}

export function sendResetPasswordMessage(receiver, link) {
	const html = getResetPasswordHTML(link);
	return sendMessage(receiver, "Reset Password", html);
}
