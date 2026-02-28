"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/logout/action";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline">
        Logout
      </Button>
    </form>
  );
}
