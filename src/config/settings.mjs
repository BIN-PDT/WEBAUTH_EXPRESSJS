import env from "env-var";

class Settings {
	PORT = env.get("PORT").default(3000).required().asIntPositive();
	SECRET_KEY = env.get("SECRET_KEY").required().asString();
	DATABASE_URI = env.get("DATABASE_URI").required().asString();
	SESSION_EXPIRY = env.get("SESSION_EXPIRY").required().asIntPositive();
	ACCESS_TOKEN_EXPIRY = env.get("ACCESS_TOKEN_EXPIRY").required().asString();
	REFRESH_TOKEN_EXPIRY = env
		.get("REFRESH_TOKEN_EXPIRY")
		.required()
		.asString();
}

export default new Settings();
