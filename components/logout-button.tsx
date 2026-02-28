"use client";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <Button type="submit" variant="outline">
        Logout
      </Button>
    </form>
  );
}
