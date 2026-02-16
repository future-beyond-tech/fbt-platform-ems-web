"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import { qualificationDefaultValues, qualificationSchema } from "@/schemas/qualificationSchema";

export default function QualificationForm({
  initialValues = qualificationDefaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Qualification",
  submitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      ...qualificationDefaultValues,
      ...initialValues,
    },
  });

  useEffect(() => {
    reset({
      ...qualificationDefaultValues,
      ...initialValues,
      graduationDate: initialValues?.graduationDate
        ? new Date(initialValues.graduationDate).toISOString().split("T")[0]
        : "",
    });
  }, [initialValues, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Degree" error={errors.degree?.message}>
        <Input placeholder="B.Sc Computer Science" {...register("degree")} />
      </FormField>

      <FormField label="Institution" error={errors.institution?.message}>
        <Input placeholder="University Name" {...register("institution")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Graduation Date" error={errors.graduationDate?.message}>
          <Input type="date" {...register("graduationDate")} />
        </FormField>

        <FormField label="Grade" error={errors.grade?.message}>
          <Input placeholder="A / 3.8 GPA" {...register("grade")} />
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
