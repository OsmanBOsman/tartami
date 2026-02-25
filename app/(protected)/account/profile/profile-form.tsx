"use client";

import { useState } from "react";

export default function ProfileForm({ profile }: { profile: any }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    neighborhood: profile?.neighborhood || "",
    country: profile?.country || "",
    avatar_url: profile?.avatar_url || "",
  });

  const approved = profile?.approved;
  const banned = profile?.banned;

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

  async function requestApproval() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/request-approval", {
      method: "POST",
    });

    if (res.ok) {
      setMessage("Approval requested. Admin will review your profile.");
    } else {
      setMessage("Failed to request approval.");
    }

    setLoading(false);
  }

  const requiredFieldsFilled =
    form.full_name &&
    form.username &&
    form.phone &&
    form.city &&
    form.neighborhood;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* STATUS */}
      <div className="p-3 rounded bg-gray-100 border">
        {banned ? (
          <p className="text-red-600 font-semibold">
            Your account is banned.
          </p>
        ) : approved ? (
          <p className="text-green-600 font-semibold">
            Your account is approved to bid.
          </p>
        ) : (
          <p className="text-yellow-600 font-semibold">
            Your account is not approved yet.
          </p>
        )}
      </div>

      {/* FORM FIELDS */}
      {[
        { key: "full_name", label: "Full Name", locked: approved },
        { key: "username", label: "Username", locked: false },
        { key: "phone", label: "Phone Number", locked: approved },
        { key: "city", label: "City (Magaalo)", locked: false },
        { key: "neighborhood", label: "Neighborhood (Xaafad)", locked: false },
        { key: "country", label: "Country", locked: false },
        { key: "avatar_url", label: "Avatar URL", locked: false },
      ].map(({ key, label, locked }) => (
        <div key={key}>
          <label className="block mb-1">{label}</label>
          <input
            type="text"
            value={(form as any)[key]}
            disabled={locked}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className={`w-full border rounded px-3 py-2 ${
              locked ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
          />
          {locked && (
            <p className="text-xs text-gray-500">
              This field cannot be changed after approval.
            </p>
          )}
        </div>
      ))}

      {/* SAVE BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {/* REQUEST APPROVAL BUTTON */}
      {!approved && !banned && (
        <button
          type="button"
          onClick={requestApproval}
          disabled={!requiredFieldsFilled || loading}
          className={`px-4 py-2 rounded border ${
            requiredFieldsFilled
              ? "bg-green-600 text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Request Approval
        </button>
      )}

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
