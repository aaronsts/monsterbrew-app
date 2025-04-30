"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function MainNavigation() {
  const pathname = usePathname();

  return (
    <div className="max-w-8xl w-full shadow-xs h-14 rounded-lg mx-3 px-6 hidden md:flex justify-between">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <h1 className="hidden text-2xl font-bold md:inline-block">
          Monsterbrew
        </h1>
      </Link>
      <nav className="flex items-center gap-4 text-md font-normal xl:gap-6">
        <Link
          href="/"
          className={cn(
            "transition-colors  hover:text-carrara-900/80",
            pathname === "/" ? "text-calypso-500 " : "text-carrara-900"
          )}
        >
          Home
        </Link>
        <Link
          href="/editor"
          className={cn(
            "transition-colors  hover:text-carrara-900/80",
            pathname === "/editor" ? "text-calypso-500 " : "text-carrara-900"
          )}
        >
          Editor
        </Link>
        <Link
          href="/my-creatures"
          className={cn(
            "transition-colors  hover:text-carrara-900/80",
            pathname === "/my-creatures"
              ? "text-calypso-500 "
              : "text-carrara-900"
          )}
        >
          My Creatures
        </Link>
      </nav>
    </div>
  );
}
