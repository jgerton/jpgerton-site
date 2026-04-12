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
          Sign in with Google to access pilot projects. You will need to be a
          YCAH community member to get started.
        </p>
        <SignInForm />
        <p className="text-sm text-muted-foreground">
          Not a YCAH member yet?{" "}
          <a
            href="https://www.skool.com/you-craft-ai-helps"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the community
          </a>
        </p>
      </div>
    </section>
  );
}
