import jwt from "jsonwebtoken";

export const createToken = (payload, type = "access") => {
	payload.type = type;
	const expiry =
		type == "access"
			? process.env.ACCESS_TOKEN_EXPIRY
			: process.env.REFRESH_TOKEN_EXPIRY;

	return jwt.sign(payload, process.env.SECRET_KEY, {
		expiresIn: expiry,
	});
};
