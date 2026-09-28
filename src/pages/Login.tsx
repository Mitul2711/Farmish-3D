import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { WheatMark } from "@/components/farmish/Logo";

type LoginProps = {
  mode?: "signin" | "signup";
};

export default function Login({ mode = "signin" }: LoginProps) {
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  useEffect(() => {
    setNotice("");
  }, [mode]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(isSignup
      ? "Account creation is not connected yet. Your details were not sent or saved."
      : "Sign-in is not connected yet. Your details were not sent or saved.");
  };

  const handleGoogleSignIn = () => {
    setNotice("Google sign-in is not connected yet. No details were sent or saved.");
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-[#F7F2E8] via-[#F3E7D2] to-[#E8D9BF] px-6 py-12 text-[#1D2B25] antialiased">
      <section aria-label="Farmish sign in" className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Farmish home">
            <WheatMark className="h-9 w-9 text-[#A36E1F]" />
            <span>
              <span className="block font-heading text-2xl leading-none text-[#1D2B25]">Farmish</span>
              <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.2em] text-[#53635D]">Farm to Home</span>
            </span>
          </Link>

          <div className="mt-12 hidden max-w-xl lg:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">Good food begins with good farmers</p>
            <h1 className="mt-4 font-heading text-5xl leading-[1.05] text-[#1D2B25] xl:text-6xl">
              Farm fresh.<br />Packed with care.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#53635D]">
              Thoughtfully selected groceries, connected to the people who grow them and the homes they nourish.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">Your Farmish account</p>
          <h2 className="mt-3 font-heading text-4xl text-[#1D2B25]">{isSignup ? "Create account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#53635D]">
            {isSignup ? "Create your Farmish account to get started." : "Sign in to your Farmish account to continue."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" aria-label={isSignup ? "Create account form" : "Sign in form"}>
            {isSignup && (
              <div>
                <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-[#1D2B25]">Full name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  className="w-full rounded-md border border-[#D9C8A5] bg-[#FFFDF9] px-4 py-3 text-sm text-[#1D2B25] outline-none transition focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15"
                />
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-[#1D2B25]">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-md border border-[#D9C8A5] bg-[#FFFDF9] px-4 py-3 text-sm text-[#1D2B25] outline-none transition focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-[#1D2B25]">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder={isSignup ? "Create a password" : "Enter your password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={isSignup ? 8 : undefined}
                required
                className="w-full rounded-md border border-[#D9C8A5] bg-[#FFFDF9] px-4 py-3 text-sm text-[#1D2B25] outline-none transition focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#D4A359] px-6 py-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#E8B86D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]"
            >
              {isSignup ? "Create account" : "Sign In"}
            </button>
            {notice && <p role="status" aria-live="polite" className="text-sm leading-relaxed text-[#53635D]">{notice}</p>}
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-[#D9C8A5]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7A796E]">or</span>
            <span className="h-px flex-1 bg-[#D9C8A5]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-[#D9C8A5] bg-[#FFFDF9] px-6 py-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#F3E7D2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]"
          >
            <span aria-hidden="true" className="font-sans text-lg font-bold text-[#4285F4]">G</span>
            Continue with Google
          </button>

          <p className="mt-5 border-l-2 border-[#D4A359] pl-3 text-xs leading-relaxed text-[#53635D]">
            Preview only. No credentials are sent or saved.
          </p>
          <p className="mt-6 text-sm text-[#53635D]">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"} className="font-semibold text-[#285A43] underline decoration-[#D4A359] underline-offset-4 hover:text-[#A36E1F]">
              {isSignup ? "Sign In" : "Sign Up"}
            </Link>
          </p>
          <p className="mt-8 text-sm text-[#53635D]">
            Need help? <Link to="/contact" className="font-semibold text-[#285A43] underline decoration-[#D4A359] underline-offset-4 hover:text-[#A36E1F]">Contact us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
