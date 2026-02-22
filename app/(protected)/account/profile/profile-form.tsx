"use client";

import { useState } from "react";

export default function ProfileForm({ profile }: { profile: any }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    phone: profile?.phone || "",
    country: profile?.country || "",
    avatar_url: profile?.avatar_url || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("Profile updated successfully.");
    } else {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["full_name", "username", "phone", "country", "avatar_url"].map((field) => (
        <div key={field}>
          <label className="block mb-1 capitalize">{field.replace("_", " ")}</label>
          <input
            type="text"
            value={(form as any)[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
