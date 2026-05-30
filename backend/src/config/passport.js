import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret_here',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our db
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          // If user exists but via local, we might want to link accounts or just return the user
          if (user.provider !== 'google') {
            user = await prisma.user.update({
              where: { email: profile.emails[0].value },
              data: {
                providerId: profile.id,
                provider: 'google',
              },
            });
          }
          done(null, user);
        } else {
          // Create new user if it doesn't exist
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName,
              providerId: profile.id,
              provider: 'google',
            },
          });
          done(null, user);
        }
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;
