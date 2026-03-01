// app/(protected)/account/page.tsx
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { session } = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Account (debug)</h1>

      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
