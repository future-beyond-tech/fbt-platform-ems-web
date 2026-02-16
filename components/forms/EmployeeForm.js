"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { DEPARTMENT_TYPES, EMPLOYEE_TYPES } from "@/lib/constants";
import { employeeDefaultValues, employeeSchema } from "@/schemas/employeeSchema";

export default function EmployeeForm({
  initialValues = employeeDefaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Employee",
  submitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      ...employeeDefaultValues,
      ...initialValues,
    },
  });

  useEffect(() => {
    reset({
      ...employeeDefaultValues,
      ...initialValues,
    });
  }, [initialValues, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Employee Name" error={errors.name?.message}>
        <Input placeholder="Enter full name" {...register("name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Employee Type" error={errors.employeeType?.message}>
          <Select {...register("employeeType")}>
            {EMPLOYEE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Department" error={errors.departmentType?.message}>
          <Select {...register("departmentType")}>
            {DEPARTMENT_TYPES.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
