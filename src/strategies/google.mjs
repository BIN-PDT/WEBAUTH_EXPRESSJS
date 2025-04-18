import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import settings from "../config/settings.mjs";
import SocialUser from "../models/social-user.mjs";

passport.use(
	new Strategy(
		{
			clientID: settings.GOOGLE_CLIENT_ID,
			clientSecret: settings.GOOGLE_CLIENT_SECRET,
			callbackURL: settings.GOOGLE_CALLBACK_URI,
		},
		async (accessToken, refreshToken, profile, done) => {
			const { id: userId, provider, emails } = profile;
			const email = emails.find((e) => e.verified === true)?.value;

			if (!email) return done(null, null);
			try {
				let user = await SocialUser.findOne({ provider, userId });
				if (user) {
					if (user.email != email) {
						user.email = email;
						await user.save();
					}
					return done(null, user);
				}

				user = await SocialUser.create({ provider, userId, email });
				return done(null, user);
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
