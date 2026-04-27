"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  googleEnabled: boolean;
  nextUrl: string;
};

export function SignInForm({ googleEnabled, nextUrl }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(nextUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-[32px] p-8">
      <div className="space-y-2">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your sales dashboard, leads, automations, and billing.</CardDescription>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="you@company.com"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <Input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" type="submit" variant="dark" disabled={loading}>
          {loading ? "Signing in..." : "Sign in with email"}
        </Button>
      </form>

      {googleEnabled ? (
        <div className="mt-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: nextUrl })}
            type="button"
          >
            Continue with Google
          </Button>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-slate-500">
        Need an account?{" "}
        <Link className="font-semibold text-slate-950" href="/register">
          Create one
        </Link>
      </p>
    </Card>
  );
}
