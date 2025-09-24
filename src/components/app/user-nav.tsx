
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";

interface UserNavProps {
    user: Profile;
}

const userColorCache = new Map<string, string>();
const colors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-purple-500'
];

const getUserColor = (userId: string) => {
  if (userColorCache.has(userId)) {
    return userColorCache.get(userId);
  }
  const color = colors[userColorCache.size % colors.length];
  userColorCache.set(userId, color);
  return color;
};


export function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, this would clear auth state.
    // Here, it just navigates to the login page.
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className={`h-9 w-9 ${getUserColor(user.id)}`}>
            <AvatarFallback className="bg-transparent">
              <UserIcon className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
