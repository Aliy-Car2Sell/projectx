"use client";

import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { Modal } from "./Modal";

/**
 * "Are you sure?" as the app's own dialog (bottom sheet on phones). Used instead of
 * `window.confirm`, which blocks the page and cannot be styled or translated consistently.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  /** The action destroys something: the confirm button is red. */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const tc = useTranslations("common");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      closeLabel={tc("close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc("cancel")}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onClose();
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-base md:text-[15px] text-heading">{message}</p>
    </Modal>
  );
}
