"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { BASE_URL } from "~/constants";
import slugify from "~/lib/slugify";
import { completeOnboarding } from "./_actions";
import { formSchema } from "./_formSchema";

export default function OnBoardingComponent() {
  const { user } = useUser();
  const router = useRouter();

  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "all",
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: "",
      orgSlug: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("orgName", values.orgName);
    formData.append("orgSlug", values.orgSlug);
    const res = await completeOnboarding(formData);

    if (res.message) {
      await user?.reload();
      router.push("/");
    }

    if (res.error) {
      setError(res.error);
    }
  }

  const defaultSlug = "acme-inc";
  function getUrlWithSlug(slug?: string) {
    if (!slug || slug === "") {
      return `${BASE_URL}/${defaultSlug}`;
    }

    return `${BASE_URL}/${slug}`;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="orgName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Inc."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    const { value } = e.target;
                    if (value && value != "") {
                      form.setValue("orgSlug", slugify(e.target.value));
                    }
                  }}
                />
              </FormControl>
              {form.formState.errors.orgName ? (
                <FormMessage>
                  {form.formState.errors.orgName.message}
                </FormMessage>
              ) : (
                <FormDescription>Your organization name</FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orgSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Slug</FormLabel>
              <FormControl>
                <Input placeholder={defaultSlug} {...field} />
              </FormControl>
              {form.formState.errors.orgSlug ? (
                <FormMessage>
                  {form.formState.errors.orgSlug.message}
                </FormMessage>
              ) : (
                <FormDescription>
                  Your organization slug. To be displayed in the url as{" "}
                  {getUrlWithSlug(field.value)}
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
