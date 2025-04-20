import { settings } from "../config/settings.mjs";
import { transporter } from "./config.mjs";
import {
	getResetPasswordTemplate,
	getVerifyEmailTemplate,
} from "./templates.mjs";

function sendMessage(receiver, subject, content) {
	return transporter.sendMail({
		from: settings.MAIL_FROM,
		to: receiver,
		subject: subject,
		html: content,
	});
}

export function sendVerifyEmailMessage(receiver, link) {
	const html = getVerifyEmailTemplate(link);
	return sendMessage(receiver, "Verify Email", html);
}

export function sendResetPasswordMessage(receiver, link) {
	const html = getResetPasswordTemplate(link);
	return sendMessage(receiver, "Reset Password", html);
}
