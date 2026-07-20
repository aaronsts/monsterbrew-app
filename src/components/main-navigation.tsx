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
            "transition-colors  hover:text-secondary",
            pathname === "/" ? "text-primary " : "text-foreground",
          )}
        >
          Home
        </Link>
        <Link
          href="/editor"
          className={cn(
            "transition-colors  hover:text-secondary",
            pathname === "/editor" ? "text-primary " : "text-foreground",
          )}
        >
          Editor
        </Link>
        <Link
          href="/my-creatures"
          className={cn(
            "transition-colors  hover:text-secondary",
            pathname === "/my-creatures" ? "text-primary " : "text-foreground",
          )}
        >
          My Creatures
        </Link>
      </nav>
    </div>
  );
}
