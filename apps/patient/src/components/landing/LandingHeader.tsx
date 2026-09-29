"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@projectx/utils";
import { Button } from "@projectx/ui/Button";
import { Logo } from "@projectx/ui/layout/Logo";
import { LanguageSwitcher } from "@projectx/ui/layout/LanguageSwitcher";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Transparent over the hero; white with a shadow as soon as the page is scrolled. */
export function LandingHeader({ login, register }: { login: string; register: string }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );
  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-[background-color,box-shadow] duration-200",
        scrolled ? "bg-card/92 shadow-md backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-2 px-page md:h-[72px]">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          {/* A phone has room for one button: the one a returning patient needs. */}
          <Button href="/login" variant="ghost" size="sm" className="max-sm:hidden">
            {login}
          </Button>
          <Button href="/login" variant="secondary" size="sm" className="sm:hidden">
            {login}
          </Button>
          <Button href="/register" size="sm" className="max-sm:hidden">
            {register}
          </Button>
        </div>
      </div>
    </header>
  );
}
