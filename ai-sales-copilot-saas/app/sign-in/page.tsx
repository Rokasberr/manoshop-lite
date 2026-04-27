import { SignInForm } from "@/components/auth/sign-in-form";

type Props = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextUrl = resolvedSearchParams.next || "/dashboard";

  return (
    <main className="bg-slate-50 py-20">
      <div className="mx-auto flex max-w-7xl justify-center px-6 lg:px-8">
        <SignInForm googleEnabled={googleEnabled} nextUrl={nextUrl} />
      </div>
    </main>
  );
}
