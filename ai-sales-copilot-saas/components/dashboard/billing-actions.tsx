"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const response = await fetch("/api/stripe/portal", {
      method: "POST",
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(payload.error ?? "Unable to open portal.");
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <Button variant="secondary" onClick={openPortal} disabled={loading}>
      {loading ? "Opening..." : "Manage billing"}
    </Button>
  );
}
