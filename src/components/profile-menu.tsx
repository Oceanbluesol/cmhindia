// components/dashboard/profile-menu.tsx
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

export function ProfileMenu({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}) {
  const initial = (displayName?.[0] || "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex bg-transparent hover:bg-gray-100 backdrop-blur-md"
          aria-label="Open profile menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-gray-800 sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <div className="px-2 pb-1 text-xs text-gray-500 truncate">{email}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/account">Account</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action="/auth/signout" method="post" className="w-full">
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
