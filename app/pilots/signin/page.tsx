import { SignInForm } from "@/components/sign-in-form";

export const metadata = {
  title: "Sign In | Pilots Hub",
  description: "Sign in to access pilot projects on jpgerton.com",
};

export default function SignInPage() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-heading font-bold">Pilots Hub</h1>
        <p className="text-lg text-muted-foreground">
          Enter your email to get a magic link. No password needed.
        </p>
        <SignInForm />
      </div>
    </section>
  );
}
