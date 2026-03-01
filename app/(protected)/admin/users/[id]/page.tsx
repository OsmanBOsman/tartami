// app/(protected)/admin/users/[id]/page.tsx
import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createRouteHandlerClient();

  const { data: user, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!user || error) {
    return <div className="p-6">User not found.</div>;
  }

  async function updateField(formData: FormData) {
    "use server";
    const supabase = await createRouteHandlerClient();

    const updates = {
      full_name: formData.get("full_name"),
      username: formData.get("username"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      neighborhood: formData.get("neighborhood"),
      country: formData.get("country"),
    };

    await supabase.from("user_profiles").update(updates).eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  async function toggleApproval() {
    "use server";
    const supabase = await createRouteHandlerClient();

    await supabase
      .from("user_profiles")
      .update({ approved: !user.approved })
      .eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  async function toggleTrusted() {
    "use server";
    const supabase = await createRouteHandlerClient();

    await supabase
      .from("user_profiles")
      .update({ trusted: !user.trusted })
      .eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  async function toggleBanned() {
    "use server";
    const supabase = await createRouteHandlerClient();

    await supabase
      .from("user_profiles")
      .update({ banned: !user.banned })
      .eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  return (
    <div className="max-w-2xl">
      {/* ...rest of your JSX unchanged... */}
    </div>
  );
}
