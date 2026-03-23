import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import config from '../config.js';

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

if (config.oauth.google.clientId) {
  passport.use(new GoogleStrategy({
    clientID: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    callbackURL: `${config.apiUrl.replace(/\/$/, '')}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(null, null, { message: 'No email from Google' });
      let user = await User.findOne({ 'oauthProviders.providerId': profile.id });
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          user.oauthProviders.push({ provider: 'google', providerId: profile.id });
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName || email.split('@')[0],
            email,
            oauthProviders: [{ provider: 'google', providerId: profile.id }],
            role: 'USER',
          });
        }
      }
      if (user.isBlocked) return done(null, null, { message: 'Account blocked' });
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
}

if (config.oauth.github.clientId) {
  passport.use(new GitHubStrategy({
    clientID: config.oauth.github.clientId,
    clientSecret: config.oauth.github.clientSecret,
    callbackURL: `${config.apiUrl.replace(/\/$/, '')}/api/auth/github/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@github.user`;
      let user = await User.findOne({ 'oauthProviders.providerId': profile.id });
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          user.oauthProviders.push({ provider: 'github', providerId: profile.id });
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName || profile.username || email.split('@')[0],
            email,
            oauthProviders: [{ provider: 'github', providerId: profile.id }],
            role: 'USER',
          });
        }
      }
      if (user.isBlocked) return done(null, null, { message: 'Account blocked' });
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
}

export default passport;
