import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import User from "../models/user.mjs";
import RevokedToken from "../models/revoked-token.mjs";

passport.use(
	"jwt",
	new Strategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.SECRET_KEY,
		},
		async (payload, done) => {
			if (payload.type != "access") return done(null, null);
			try {
				if (await RevokedToken.findOne({ jti: payload.jti }))
					return done(null, null);

				const user = await User.findById(payload.sub);
				if (!user) return done(null, null);

				return done(null, { payload, user });
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
