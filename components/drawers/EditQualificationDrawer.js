"use client";

import Drawer from "@/components/ui/Drawer";
import QualificationForm from "@/components/forms/QualificationForm";

export default function EditQualificationDrawer({
  open,
  onClose,
  qualification,
  onSubmit,
  submitting,
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit Qualification"
      description="Update degree details, institution and graduation records."
    >
      <QualificationForm
        initialValues={qualification}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel="Update Qualification"
        submitting={submitting}
      />
    </Drawer>
  );
}
