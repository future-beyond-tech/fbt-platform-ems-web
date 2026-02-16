"use client";

import Modal from "@/components/ui/Modal";
import EmployeeForm from "@/components/forms/EmployeeForm";

export default function AddEmployeeModal({ open, onClose, onSubmit, submitting }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Employee"
      description="Create a new employee profile with role and department mapping."
      size="md"
    >
      <EmployeeForm onSubmit={onSubmit} onCancel={onClose} submitLabel="Create Employee" submitting={submitting} />
    </Modal>
  );
}
