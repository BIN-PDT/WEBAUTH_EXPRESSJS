import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import settings from "./config/settings.mjs";
import router from "./routes/index.mjs";
import "./strategies/local.mjs";
import "./strategies/jwt.mjs";
import "./strategies/google.mjs";

await mongoose.connect(settings.DATABASE_URI);

const app = express();

app.use(express.json());
app.use(cookieParser(settings.SECRET_KEY));
app.use(
	session({
		secret: settings.SECRET_KEY,
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: settings.SESSION_EXPIRY,
		},
		store: MongoStore.create({
			client: mongoose.connection.getClient(),
		}),
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.listen(settings.PORT, () => {
	console.log(`App is listening on port ${settings.PORT}`);
});
