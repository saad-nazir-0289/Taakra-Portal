import { Router } from 'express';
import passport from '../lib/passport.js';
import { signAccessToken, signRefreshToken, addRefreshToken } from '../lib/tokens.js';
import config from '../config.js';

const router = Router();

function setTokenCookies(res, accessToken, refreshToken) {
  const isDev = config.nodeEnv === 'development';
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: !isDev, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: !isDev, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function oauthCallback(provider) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
      }
      const accessToken = signAccessToken(user._id, user.role);
      const refreshToken = signRefreshToken(user._id, user.role);
      await addRefreshToken(user._id, refreshToken);
      setTokenCookies(res, accessToken, refreshToken);
      const params = new URLSearchParams({ accessToken, refreshToken });
      res.redirect(`${config.clientUrl}/auth/callback?${params.toString()}`);
    } catch (e) {
      next(e);
    }
  };
}

if (config.oauth.google.clientId) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { session: false }), oauthCallback('google'));
}
if (config.oauth.github.clientId) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
  router.get('/github/callback', passport.authenticate('github', { session: false }), oauthCallback('github'));
}

export default router;
