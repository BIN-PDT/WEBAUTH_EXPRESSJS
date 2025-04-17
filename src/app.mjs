import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import router from "./routes/index.mjs";
import "./strategies/local.mjs";
import "./strategies/jwt.mjs";

await mongoose.connect(process.env.DATABASE_URI);

const app = express();

const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json());
app.use(cookieParser(SECRET_KEY));
app.use(
	session({
		secret: SECRET_KEY,
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: parseInt(process.env.SESSION_EXPIRY),
		},
		store: MongoStore.create({
			client: mongoose.connection.getClient(),
		}),
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`App is listening on port ${PORT}`);
});
