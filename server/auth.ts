// server/auth.ts
import type { Express, RequestHandler } from "express";
import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { createPool } from "@vercel/postgres";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

// URL de callback utilisée pour Google OAuth (prod)
const PUBLIC_BASE_URL = "https://elegance-dusky.vercel.app"; // prod
const CALLBACK_PATH = "/api/callback";
const REDIRECT_URI = `${PUBLIC_BASE_URL}${CALLBACK_PATH}`;

// Middleware pour vérifier les tokens JWT
const verifyJWT = (req: any, res: any, next: any) => {
  const token = req.cookies?.session;
  
  if (!token) {
    return next();
  }

  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      return next();
    }

    const decoded = jwt.verify(token, secret) as any;
    if (decoded && decoded.sub) {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        provider: decoded.provider
      };
    }
  } catch (error) {
    console.error("JWT verification failed:", error);
  }
  
  next();
};

export async function setupAuth(app: Express): Promise<void> {
  const {
    SESSION_SECRET,
    DATABASE_URL,
    POSTGRES_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    NODE_ENV,
  } = process.env;

  const connectionString = DATABASE_URL || POSTGRES_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL/POSTGRES_URL is missing');
  }
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET is missing');
  }

  const clientID = (GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (GOOGLE_CLIENT_SECRET || "").trim();

  if (!clientID || !clientSecret) {
    throw new Error(
      "Google OAuth: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET doivent être définis dans .env"
    );
  }

  const callbackUrlString = REDIRECT_URI;
  const callbackPath = CALLBACK_PATH;

  // ---- Sessions ----
  app.set("trust proxy", 1); // requis si on est derrière un proxy (ngrok/railway/etc.)

  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 jours
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    pool: createPool({ connectionString }),
    createTableIfMissing: false, // mets true si la table "sessions" n'existe pas
    ttl: sessionTtl / 1000, // connect-pg-simple attend des secondes si set via "ttl"
    tableName: "sessions",
  });

  app.use(
    session({
      secret: SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV === "production",
        maxAge: sessionTtl,
        sameSite: NODE_ENV === "production" ? "lax" : "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  
  // Ajouter le middleware JWT après Passport
  app.use(verifyJWT);

  // ---- Strategies ----
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: callbackUrlString,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"));
          const userData = {
            email,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
          };
          const fullUser = await storage.upsertUser(userData);
          return done(null, fullUser);
        } catch (err) {
          return done(err as Error);
        }
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
        return done(err as Error);
      }
    })
  );

  // ---- Serialize / deserialize ----
  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((obj: any, done) => done(null, obj));

  // ---- Routes Auth ----
  // Lance le flow Google
  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  // Callback exact (même path que dans l'URL fournie à Google)
  app.get(
    callbackPath,
    passport.authenticate("google", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })
  );

  // Local login
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

  // Register (local)
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password required" });
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ message: "Email already in use" });
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

  // Utilisateur courant
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const user = req.user;
    res.json({ user });
  });

  // Logout (GET et POST)
  const logoutHandler = (req: any, res: any) => {
    req.logout(() => {
      // Supprimer le cookie JWT aussi
      res.clearCookie('session');
      if (req.method === "GET") res.redirect("/");
      else res.json({ success: true });
    });
  };
  app.post("/api/logout", logoutHandler);
  app.get("/api/logout", logoutHandler);

  console.log(`[auth] Google OAuth prêt (callback: ${callbackUrlString})`);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié via Passport ou JWT
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  if (req.user) return next(); // JWT authentication
  return res.status(401).json({ message: "Unauthorized" });
};
