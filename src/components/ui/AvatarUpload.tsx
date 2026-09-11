"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

/**
 * Avatar with a "change photo" button. The chosen image is shown immediately
 * via an object URL; nothing is uploaded (no backend yet).
 */
export function AvatarUpload({
  src,
  name,
  label,
  size = "xl",
  children,
}: {
  src?: string;
  name: string;
  label: string;
  size?: "lg" | "xl";
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <div className="flex items-center gap-4">
      <Avatar src={preview ?? src} name={name} size={size} ring />
      <div>
        <Button variant="secondary" size="sm" icon={<Camera className="h-4 w-4" />} onClick={() => inputRef.current?.click()}>
          {label}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={label}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
            e.target.value = "";
          }}
        />
        {children}
      </div>
    </div>
  );
}
