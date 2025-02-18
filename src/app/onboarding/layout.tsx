import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await auth()).sessionClaims?.metadata?.onboardingComplete === true) {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      <div className="m-auto w-1/3">{children}</div>
    </div>
  );
}
