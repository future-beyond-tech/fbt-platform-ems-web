"use client";

import Drawer from "@/components/ui/Drawer";
import EmployeeForm from "@/components/forms/EmployeeForm";

export default function EditEmployeeDrawer({ open, onClose, employee, onSubmit, submitting }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit Employee"
      description="Update employee type, department and identity information."
    >
      <EmployeeForm
        initialValues={employee}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel="Update Employee"
        submitting={submitting}
      />
    </Drawer>
  );
}
