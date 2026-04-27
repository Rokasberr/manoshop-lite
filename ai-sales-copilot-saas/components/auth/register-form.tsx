"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getErrorMessage(payload: unknown) {
    if (payload && typeof payload === "object" && "error" in payload) {
      const value = (payload as { error?: unknown }).error;

      if (typeof value === "string") {
        return value;
      }

      if (value && typeof value === "object" && "formErrors" in value) {
        const formErrors = (value as { formErrors?: string[] }).formErrors;
        if (formErrors?.length) {
          return formErrors[0];
        }
      }
    }

    return "Unable to create account.";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(getErrorMessage(payload));
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/pricing");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-[32px] p-8">
      <div className="space-y-2">
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start with a trial workspace and upgrade to a paid plan when ready.</CardDescription>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="Your name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <Input
          placeholder="you@company.com"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <Input
          placeholder="Create password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" type="submit" variant="dark" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Already have access?{" "}
        <Link className="font-semibold text-slate-950" href="/sign-in">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
