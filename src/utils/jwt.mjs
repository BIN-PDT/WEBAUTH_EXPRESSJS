import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import settings from "../config/settings.mjs";
import RevokedToken from "../models/revoked-token.mjs";

export const createToken = (payload, type = "access") => {
	payload.type = type;
	const expiry =
		type == "access"
			? settings.ACCESS_TOKEN_EXPIRY
			: settings.REFRESH_TOKEN_EXPIRY;

	return jwt.sign(payload, settings.SECRET_KEY, {
		expiresIn: expiry,
	});
};

export const decodeToken = (token) => {
	const result = { error: null, data: null };
	try {
		result.data = jwt.verify(token, settings.SECRET_KEY);
	} catch (error) {
		result.error = error;
	}
	return result;
};

export const revokeToken = async (payload) => {
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
};

export const createTokenPair = (user) => {
	const payload = { sub: user.id, jti: uuidv4() };
	return {
		accessToken: createToken(payload),
		refreshToken: createToken(payload, "refresh"),
	};
};
