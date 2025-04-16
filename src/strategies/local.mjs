import passport from "passport";
import { Strategy } from "passport-local";
import User from "../models/user.mjs";
import { comparePassword } from "../utils/password.mjs";

passport.use(
	"local",
	new Strategy(async (username, password, done) => {
		const findUser = await User.findOne({ username });
		if (
			!findUser ||
			!(await comparePassword(password, findUser.password))
		) {
			const error = { statusCode: 401, message: "Invalid credentials." };
			done(error, false);
			return;
		}
		done(null, findUser);
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const findUser = await User.findById(id);
	if (!findUser) {
		const error = { statusCode: 404, message: "User not found." };
		done(error, false);
		return;
	}
	done(null, findUser);
});
