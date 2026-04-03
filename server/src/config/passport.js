// server/src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

// ✅ Safety check for required environment variables
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET
) {
  throw new Error(
    "❌ Missing required Google OAuth environment variables. Please check .env file.",
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.CLIENT_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if a user with the same email already exists (e.g. created via a different OAuth provider)
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
          }

          if (user) {
            // Link this Google account to the existing user — prevents E11000 duplicate key error
            user.googleId = profile.id;
            user.name = user.name || profile.displayName;
            user.picture = user.picture || profile.photos?.[0]?.value;
            await user.save();
          } else {
            // Completely new user — safe to insert
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email,
              picture: profile.photos?.[0]?.value,
            });
            await user.save();
          }
        } else {
          await user.updateLoginTime();
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Error in GoogleStrategy:", err);
        return done(err, null);
      }
    },
  ),
);

// Store only user.id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve full user from DB by id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("❌ Error in deserializeUser:", err);
    done(err, null);
  }
});

export default passport;
