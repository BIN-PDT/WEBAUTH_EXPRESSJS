import passport from "passport";
import { Strategy } from "passport-local";
import User from "../models/user.mjs";
import { comparePassword } from "../utils/password.mjs";

passport.use(
	"local",
	new Strategy((username, password, done) => {
		User.findOne({ username })
			.then(async (user) => {
				if (!user || !(await comparePassword(password, user.password)))
					return done(null, null);
				return done(null, user);
			})
			.catch((error) => done(error, null));
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	User.findById(id)
		.then((user) => done(null, user))
		.catch((error) => done(error, null));
});
