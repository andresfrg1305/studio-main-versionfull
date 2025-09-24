
"use client";

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserNav } from '@/components/app/user-nav';
import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Profile } from '@/lib/types';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    const unsub = auth!.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profileSnap = await getDoc(doc(db!, 'profiles', firebaseUser.uid));
        if (profileSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...profileSnap.data() } as Profile);
        } else {
          // If no profile, create a basic one
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'Residente',
            role: 'resident',
            phone: '',
            interiorNumber: 0,
            houseNumber: '',
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  if (!user) {
    // Render with a default user or loading
    const defaultUser: Profile = {
      id: '',
      email: '',
      fullName: 'Residente',
      role: 'resident',
      phone: '',
      interiorNumber: 0,
      houseNumber: '',
      createdAt: new Date(),
    };
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar user={defaultUser} />
          <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
              <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                      type="search"
                      placeholder="Buscar..."
                      className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 h-9 rounded-md border border-input"
                  />
              </div>
              <UserNav user={defaultUser} />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
              <div className="min-h-screen flex items-center justify-center">Cargando...</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={user} />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 h-9 rounded-md border border-input"
                />
            </div>
            <UserNav user={user} />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
