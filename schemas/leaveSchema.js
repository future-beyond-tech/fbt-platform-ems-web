import { z } from "zod";
import { LEAVE_STATUSES } from "@/lib/constants";

export const leaveSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    leaveStatus: z.enum(LEAVE_STATUSES),
    reason: z.string().min(5, "Reason is required"),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });
