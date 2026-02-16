import { z } from "zod";
import { DEPARTMENT_TYPES, EMPLOYEE_TYPES } from "@/lib/constants";

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  employeeType: z.enum(EMPLOYEE_TYPES, {
    errorMap: () => ({ message: "Employee type is required" }),
  }),
  departmentType: z.enum(DEPARTMENT_TYPES, {
    errorMap: () => ({ message: "Department is required" }),
  }),
});

export const employeeDefaultValues = {
  name: "",
  employeeType: EMPLOYEE_TYPES[0],
  departmentType: DEPARTMENT_TYPES[0],
};
