import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createRouteHandlerClient(); // ⭐ FIX

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return;
    }

    redirect("/account");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>

        <form action={login} className="flex flex-col gap-4">
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
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
