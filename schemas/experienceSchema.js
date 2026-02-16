import { z } from "zod";

export const experienceSchema = z
  .object({
    companyName: z.string().min(2, "Company name is required"),
    jobTitle: z.string().min(2, "Job title is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().or(z.literal("")),
    responsibilities: z.string().min(10, "Responsibilities are required"),
  })
  .refine(
    (value) => {
      if (!value.endDate) return true;
      return new Date(value.endDate) >= new Date(value.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );
