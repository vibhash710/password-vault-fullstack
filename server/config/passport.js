const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// ========== GOOGLE STRATEGY ==========

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async (accessToken, refreshToken, profile, done) => {

    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(null, false, {
          message: 'No email found in Google profile'
        });
      }

      // High resolution profile image
      const photo = profile.photos?.[0]?.value?.replace('=s96-c', '=s400-c') || null;

      // 1. Check if user already exists
      let user = await User.findOne({
        authProvider: 'google',
        providerId: profile.id
      });

      if (user) {
        // Update profile picture if changed or missing
        if (photo && user.profilePicture !== photo) {
          user.profilePicture = photo;
          await user.save();
        }
        // User exists → Log them in
        return done(null, user);
      }

      // 2. Check if email already exists (linked to local account)
      const existingEmailUser = await User.findOne({ email });

      if (existingEmailUser) {
        if (existingEmailUser.authProvider === 'local') {
          return done(null, false, {
            message: 'This email is already registered. Please sign in with your password.'
          });
        } else {
          return done(null, false, {
            message: `Email already registered with ${existingEmailUser.authProvider}.`
          });
        }
      }

      // 3. User doesn't exist → Create new user
      user = await User.create({
        name: profile.displayName,
        email: email,
        authProvider: 'google',
        providerId: profile.id,
        profilePicture: photo,
        emailVerified: true  // Google emails are verified
      });

      return done(null, user); // This attaches: req.user = user

    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, false, {
        message: 'An error occurred during Google authentication.'
      });
    }
  }
));


// ========== GITHUB STRATEGY ==========

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email']  // Request email access
},
  async (accessToken, refreshToken, profile, done) => {

    try {
      // 1. Get primary email
      const email = profile.emails?.find(e => e.primary)?.value || profile.emails?.[0]?.value;

      if (!email) {
        return done(null, false, {
          message: 'No email found in GitHub profile'
        });
      }

      const photo = profile.photos?.[0]?.value || null;

      // 2.. Check if user exists
      let user = await User.findOne({
        authProvider: 'github',
        providerId: profile.id
      });

      if (user) {
        // Update avatar if changed
        if (photo && user.profilePicture !== photo) {
          user.profilePicture = photo;
          await user.save();
        }
        return done(null, user);
      }

      // 3. Check if email exists
      const existingEmailUser = await User.findOne({ email });

      if (existingEmailUser) {
        if (existingEmailUser.authProvider === 'local') {
          return done(null, false, {
            message: 'This email is already registered. Please sign in with your password.'
          });
        } else {
          return done(null, false, {
            message: `Email already registered with ${existingEmailUser.authProvider}.`
          });
        }
      }

      // 4. Create new user
      user = await User.create({
        name: profile.displayName || profile.username,
        email: email,
        authProvider: 'github',
        providerId: profile.id,
        profilePicture: photo,
        emailVerified: true
      });

      return done(null, user);

    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, false, {
        message: 'An error occurred during GitHub authentication.'
      });
    }
  }
));

module.exports = passport;