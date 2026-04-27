import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="bg-slate-50 py-20">
      <div className="mx-auto flex max-w-7xl justify-center px-6 lg:px-8">
        <RegisterForm />
      </div>
    </main>
  );
}
