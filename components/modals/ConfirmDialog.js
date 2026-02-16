"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-700">This action may affect linked records and cannot be easily undone.</p>
    </Modal>
  );
}
