import { z } from "zod";

// const auditableEntitySchema = z.object({
//   createdAt: z.date().default(new Date()),
//   createdBy: z.string().nonempty(),
//   updatedAt: z.date().optional().nullable(),
//   updatedBy: z.date().optional().nullable(),
// });

const addressSchema = z.object({
  address1: z.string().nonempty(),
  address2: z.string().optional().nullable(),
  city: z.string().nonempty().max(50),
  province: z.string().nonempty().length(2),
  postalCode: z.string().nonempty().length(6),
  country: z.string().nonempty().length(2),
});

const tenantSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  address: addressSchema,
});

const userSchema = z.object({
  id: z.string().nonempty(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
});
