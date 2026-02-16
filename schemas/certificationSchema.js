import { z } from "zod";

export const certificationSchema = z
  .object({
    certificationName: z.string().min(2, "Certification name is required"),
    issuingOrganization: z.string().min(2, "Issuing organization is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    expiryDate: z.string().optional().or(z.literal("")),
  })
  .refine(
    (value) => {
      if (!value.expiryDate) return true;
      return new Date(value.expiryDate) >= new Date(value.issueDate);
    },
    {
      message: "Expiry date must be after issue date",
      path: ["expiryDate"],
    },
  );
