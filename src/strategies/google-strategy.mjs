import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { settings } from "../config/settings.mjs";
import { SocialUserRepository } from "../repositories/social-user.mjs";

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
				let user;

				const query = { provider, userId };
				user = await SocialUserRepository.findOne(query);
				if (user) {
					if (user.email != email) {
						user.email = email;
						await user.save();
					}
					return done(null, user);
				}

				const data = { provider, userId, email };
				user = await SocialUserRepository.create(data);
				return done(null, user);
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
