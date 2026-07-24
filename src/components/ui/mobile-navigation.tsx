"use client";

import * as React from "react";
import { Link } from "@tanstack/react-router";

import { Menu } from "lucide-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false);

  const onOpenChange = React.useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div className="w-full bg-carrara-100 flex justify-between items-center md:hidden shadow-xs h-14 rounded-lg mx-3 px-6">
        <Link to="/" className="mr-4 flex w-fit items-center gap-2 lg:mr-6">
          <h1 className="text-xl font-bold">Monsterbrew</h1>
        </Link>
        <div className="flex items-center gap-2">
          <SheetTrigger render={<Button color="neutral" variant="transparent" size="icon" />}>
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
        </div>
      </div>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle></SheetTitle>
        <div className="overflow-auto p-6">
          <div className="flex flex-col gap-4 items-center">
            <MobileLink to="/" onOpenChange={setOpen}>
              Home
            </MobileLink>
            <MobileLink to="/editor" onOpenChange={setOpen}>
              Editor
            </MobileLink>
            <MobileLink to="/library" onOpenChange={setOpen}>
              Library
            </MobileLink>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps {
  to: string;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  to,
  onOpenChange,
  className,
  children,
}: MobileLinkProps) {
  return (
    <Link
      to={to}
      onClick={() => {
        onOpenChange?.(false);
      }}
      className={cn("text-xl font-medium", className)}
    >
      {children}
    </Link>
  );
}
