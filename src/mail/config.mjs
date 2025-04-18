import nodemailer from "nodemailer";
import { settings } from "../config/settings.mjs";

export const transporter = nodemailer.createTransport({
	host: settings.MAIL_HOST,
	port: settings.MAIL_PORT,
	secure: settings.MAIL_PORT == 465,
	auth: {
		user: settings.MAIL_USERNAME,
		pass: settings.MAIL_PASSWORD,
	},
});
