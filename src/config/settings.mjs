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
	GOOGLE_CLIENT_ID = env.get("GOOGLE_CLIENT_ID").required().asString();
	GOOGLE_CLIENT_SECRET = env
		.get("GOOGLE_CLIENT_SECRET")
		.required()
		.asString();
	GOOGLE_CALLBACK_URI = env
		.get("GOOGLE_CALLBACK_URI")
		.required()
		.asUrlString();
}

export default new Settings();
