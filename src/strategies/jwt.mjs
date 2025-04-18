import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { settings } from "../config/settings.mjs";
import { User } from "../models/user.mjs";
import { checkRevokedToken } from "../utils/jwt.mjs";

passport.use(
	"jwt",
	new Strategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: settings.SECRET_KEY,
		},
		async (payload, done) => {
			if (payload.type != "access") return done(null, null);

			const { error, data } = await checkRevokedToken(payload.jti);
			if (error) return done(error, null);
			if (data) return done(null, null);

			try {
				const user = await User.findById(payload.sub);
				if (!user) return done(null, null);

				return done(null, { payload, user });
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
