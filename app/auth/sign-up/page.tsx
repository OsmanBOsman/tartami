import { createClient } from "@/utils/supabase/server-client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  async function signup(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const cookieStore = cookies();
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Signup error:", error.message);
      return;
    }

    redirect("/account");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Create an account</h1>

        <form action={signup} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            required
          />

          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
      </div>
    </div>
  );
}
