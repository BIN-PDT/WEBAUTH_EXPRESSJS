import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { settings } from "../config/settings.mjs";
import { UserRepository } from "../repositories/user.mjs";
import { findRevokedToken } from "../utils/token.mjs";

passport.use(
	"jwt",
	new Strategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: settings.SECRET_KEY,
		},
		async (payload, done) => {
			if (payload.type != "access") return done(null, null);

			try {
				const token = await findRevokedToken(payload.jti);
				if (token) return done(null, null);

				const user = await UserRepository.findById(payload.sub);
				if (!user) return done(null, null);

				return done(null, { payload, user });
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
