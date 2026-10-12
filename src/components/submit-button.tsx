"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="rh-button">
      {pending ? "Please wait..." : children}
    </button>
  );
}
