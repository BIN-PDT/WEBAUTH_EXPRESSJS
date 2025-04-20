import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../models/user.mjs";
import { SocialUser } from "../models/social-user.mjs";
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
	const userClaims = { provider: user?.provider, id: user.id };
	done(null, userClaims);
});

passport.deserializeUser(async ({ provider, id }, done) => {
	try {
		const UserModel = provider ? SocialUser : User;
		const user = await UserModel.findById(id);
		return done(null, user);
	} catch (error) {
		return done(error, null);
	}
});
