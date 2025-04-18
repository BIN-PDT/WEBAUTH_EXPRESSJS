import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { settings } from "../config/settings.mjs";
import { RevokedToken } from "../models/revoked-token.mjs";

export function createToken(payload, type = "access") {
	payload.type = type;
	const expiry =
		type == "access"
			? settings.ACCESS_TOKEN_EXPIRY
			: settings.REFRESH_TOKEN_EXPIRY;

	return jwt.sign(payload, settings.SECRET_KEY, {
		expiresIn: expiry,
	});
}

export function decodeToken(token) {
	const result = { error: null, data: null };
	try {
		result.data = jwt.verify(token, settings.SECRET_KEY);
	} catch (error) {
		result.error = error;
	}
	return result;
}

export async function checkRevokedToken(jti) {
	const result = { error: null, data: null };
	try {
		result.data = await RevokedToken.findOne({ jti });
	} catch (error) {
		result.error = error;
	}
	return result;
}

export async function revokeToken(payload) {
	const result = { error: null, data: null };
	try {
		result.data = await RevokedToken.create({
			jti: payload.jti,
			expiresAt: new Date(payload.exp * 1000),
		});
	} catch (error) {
		result.error = error;
	}
	return result;
}

export function createTokenPair(user) {
	const payload = { sub: user.id, jti: uuidv4() };
	return {
		accessToken: createToken(payload),
		refreshToken: createToken(payload, "refresh"),
	};
}

export function createMailToken(user, expiry) {
	const payload = { sub: user.id, type: "mail", jti: uuidv4() };
	return jwt.sign(payload, settings.SECRET_KEY, { expiresIn: expiry });
}
