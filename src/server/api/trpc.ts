/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import type { User as PrismaUser } from "@prisma/client";
import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { Session, User } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";

type CreateContextOptions = {
  headers: Headers;
  session?: Session | null;
  user?: PrismaUser;
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const CreateTRPCContext = async (opts: CreateContextOptions) => {
  return {
    db,
    ...opts,
  };
};

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>> &
  Partial<CreateNextContextOptions>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const middleware = t.middleware;

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

const isAuthed = middleware(async ({ ctx, next }) => {
  const { user, session } = await getUserSession(ctx);
  if (!user || !session) {
    throw new Error("UNAUTHORIZED");
  }

  return next({
    ctx: { user, session },
  });
});

export const authedProcedure = t.procedure.use(isAuthed);

const getSession = async (ctx: TRPCContext) => {
  const { req, res } = ctx;
  return req && res ? await getServerSession(req, res, {}) : null;
};

type Maybe<T> = T | null | undefined;

async function getUserFromSession(
  ctx: TRPCContext,
  session: Maybe<Session>,
): Promise<User | null> {
  if (!session) return null;
  if (!session.user?.id) return null;

  const userFromDb = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!userFromDb) return null;

  const user: User = {
    id: userFromDb.id,
    username: userFromDb.username,
    email: userFromDb.email,
    avatarUrl: userFromDb.avatarUrl,
    locale: userFromDb.locale,
    role: userFromDb.role,
  };

  if (userFromDb.organizationId) {
    const org = await db.organization.findUnique({
      where: {
        id: userFromDb.organizationId,
      },
    });
    if (org) {
      user.org = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
      };
    }
  }

  return user;
}

const getUserSession = async (ctx: TRPCContext) => {
  const session = ctx.session ?? (await getSession(ctx));
  const user = session
    ? await getUserFromSession(ctx, session as Session)
    : null;

  return { user, session };
};
