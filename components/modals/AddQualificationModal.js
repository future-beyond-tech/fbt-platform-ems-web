"use client";

import QualificationForm from "@/components/forms/QualificationForm";
import Modal from "@/components/ui/Modal";

export default function AddQualificationModal({ open, onClose, onSubmit, submitting }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Qualification"
      description="Add an educational qualification to this employee profile."
    >
      <QualificationForm
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel="Add Qualification"
        submitting={submitting}
      />
    </Modal>
  );
}
