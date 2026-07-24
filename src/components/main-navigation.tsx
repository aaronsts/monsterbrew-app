"use client";

import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function MainNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="max-w-8xl w-full shadow-xs h-14 rounded-lg mx-3 px-6 hidden md:flex justify-between">
      <Link to="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <h1 className="hidden text-2xl font-bold md:inline-block">
          Monsterbrew
        </h1>
      </Link>
      <nav className="flex items-center gap-4 text-md font-normal xl:gap-6">
        <Link
          to="/"
          className={cn(
            "transition-colors  hover:text-secondary",
            pathname === "/" ? "text-accent " : "text-foreground",
          )}
        >
          Home
        </Link>
        <Link
          to="/editor"
          className={cn(
            "transition-colors  hover:text-secondary",
            pathname === "/editor" ? "text-accent " : "text-foreground",
          )}
        >
          Editor
        </Link>
        <Link
          to="/library"
          className={cn(
            "transition-colors  hover:text-secondary",
            pathname.startsWith("/library")
              ? "text-accent "
              : "text-foreground",
          )}
        >
          Library
        </Link>
      </nav>
    </div>
  );
}
