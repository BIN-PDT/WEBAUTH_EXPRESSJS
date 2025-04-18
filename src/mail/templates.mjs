export function getSignupHTML(link) {
	return (
		'<div style="font-style: italic;">\n' +
		"<p>Welcome! We are sending this email to notify you about an important event.</p>\n" +
		`<p>Please click the <a href="${link}">link</a> to verify your account.</p>\n` +
		"<p>Best regards,<br>ExpressJS</p>\n" +
		"</div>"
	);
}

export function getResetPasswordHTML(link) {
	return (
		'<div style="font-style: italic;">\n' +
		"<p>Welcome! We are sending this email to notify you about an important event.</p>\n" +
		`<p>Please click the <a href="${link}">link</a> to reset your account password.</p>\n` +
		"<p>Best regards,<br>FastAPI</p>\n" +
		"</div>"
	);
}
