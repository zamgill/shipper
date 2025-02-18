"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { formSchema } from "./_formSchema";

export const completeOnboarding = async (formData: FormData) => {
  const formValues = extractFormValues(formData);
  const data = formSchema.parse(formValues);
  const { userId } = await auth();

  if (!userId) {
    return {
      message: "No Logged In User",
    };
  }

  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        organizationName: data.orgName,
        organizationSlug: data.orgSlug,
      },
    });

    return { message: res.publicMetadata };
  } catch (err) {
    console.error(err);
    return { error: "There was an error updating the user metadata." };
  }
};

function extractFormValues(formData: FormData) {
  const orgName = formData.get("orgName");
  const orgSlug = formData.get("orgSlug");
  return { orgName, orgSlug };
}
