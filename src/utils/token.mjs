import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { settings } from "../config/settings.mjs";
import { RevokedToken } from "../models/revoked-token.mjs";

function createToken(payload, type, expiry) {
	payload.type = type;
	return jwt.sign(payload, settings.SECRET_KEY, { expiresIn: expiry });
}

export function createMailToken(user, expiry) {
	const payload = { sub: user.id, jti: uuidv4() };
	return createToken(payload, "mail", expiry);
}

export function createAuthToken(payload, type) {
	expiry =
		type === "access"
			? settings.ACCESS_TOKEN_EXPIRY
			: settings.REFRESH_TOKEN_EXPIRY;
	return createToken(payload, type, expiry);
}

export function createAuthTokenPair(user) {
	const payload = { sub: user.id, jti: uuidv4() };
	return {
		accessToken: createAuthToken(payload, "access"),
		refreshToken: createAuthToken(payload, "refresh"),
	};
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

export async function checkRevokedToken(jti) {
	const result = { error: null, data: null };
	try {
		result.data = await RevokedToken.findOne({ jti });
	} catch (error) {
		result.error = error;
	}
	return result;
}
