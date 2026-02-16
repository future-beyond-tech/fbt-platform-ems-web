import { z } from "zod";

export const qualificationSchema = z.object({
  degree: z.string().min(2, "Degree is required"),
  institution: z.string().min(2, "Institution is required"),
  graduationDate: z
    .string()
    .min(1, "Graduation date is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid graduation date"),
  grade: z.string().min(1, "Grade is required"),
});

export const qualificationDefaultValues = {
  degree: "",
  institution: "",
  graduationDate: "",
  grade: "",
};
