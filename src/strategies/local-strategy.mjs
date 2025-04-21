import passport from "passport";
import { Strategy } from "passport-local";
import { UserRepository } from "../repositories/user.mjs";
import { SocialUserRepository } from "../repositories/social-user.mjs";
import { comparePassword } from "../utils/password.mjs";

passport.use(
	"local",
	new Strategy((username, password, done) => {
		UserRepository.findOne({ username })
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
	const UserModel = provider ? SocialUserRepository : UserRepository;
	UserModel.findById(id)
		.then((user) => done(null, user))
		.catch((error) => done(error, null));
});
