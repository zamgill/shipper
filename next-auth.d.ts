import type { User as PrismaUser, UserPermissionRole } from "@prisma/client";
import type { Session as DefaultSession, DefaultUser } from "next-auth";

type Org = {
  id: string;
  name?: string;
  slug: string;
  logoUrl?: string | null;
};

export {};
declare module "next-auth" {
  interface Session extends DefaultSession<Omit<"user">> {
    user: User;
  }

  interface User extends Omit<DefaultUser, "id"> {
    id: string;
    org?: Org;
    username?: PrismaUser["username"];
    email: PrismaUser["email"];
    avatarUrl?: PrismaUser["avatarUrl"];
    role?: PrismaUser["role"];
    locale?: string | null;
    // profile?: UserProfile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | number;
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
    profileId?: number | null;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    role?: UserPermissionRole | null;
    org?: Org;
    organizationId?: number | null;
    locale?: string;
  }
}

// This is needed to preserve the original module exports
declare module "next-auth/react" {
  export * from "next-auth/react";
}
