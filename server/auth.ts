// server/auth.ts
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

export async function setupAuth(app: Express): Promise<void> {
  const {
    SESSION_SECRET,
    DATABASE_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    PUBLIC_BASE_URL,
    GOOGLE_CALLBACK_PATH = "/api/callback",
    NODE_ENV,
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !PUBLIC_BASE_URL) {
    throw new Error("Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et PUBLIC_BASE_URL doivent être définis dans .env");
  }

  app.set("trust proxy", 1);

  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    conString: DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(
    session({
      secret: SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const callbackURL = new URL(GOOGLE_CALLBACK_PATH, PUBLIC_BASE_URL).toString();

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        const userData = {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: profile.photos?.[0]?.value,
        };
        const fullUser = await storage.upsertUser(userData); // <- assure-toi que ça retourne le role aussi
        done(null, fullUser);
      }
    )
  );

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.passwordHash) {
          return done(null, false, { message: "Invalid email or password" });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj as Express.User));

  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    GOOGLE_CALLBACK_PATH,
    passport.authenticate("google", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })
  );

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
      req.logIn(user, (err: any) => {
        if (err) return next(err);
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, passwordHash, firstName, lastName });
      req.logIn(user, (err: any) => {
        if (err) return next(err);
        return res.json({ user });
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const user = req.user;
    console.log("[DEBUG] Authenticated user:", user);
    res.json({ user }); // <- Doit contenir .role, .email, etc.
  });

  const logoutHandler = (req: any, res: any) => {
    req.logout(() => {
      if (req.method === "GET") {
        res.redirect("/");
      } else {
        res.json({ success: true });
      }
    });
  };

  app.post("/api/logout", logoutHandler);
  app.get("/api/logout", logoutHandler);

  console.log(`[auth] Google OAuth prêt (callback: ${callbackURL})`);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};
