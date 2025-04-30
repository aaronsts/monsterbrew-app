"use client";

import * as React from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";
import { Menu } from "lucide-react";

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false);

  const onOpenChange = React.useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div className="w-full bg-carrara-100 flex justify-between items-center md:hidden shadow-xs h-14 rounded-lg mx-3 px-6">
        <Link href="/" className="mr-4 flex w-fit items-center gap-2 lg:mr-6">
          <h1 className="text-xl font-bold">Monsterbrew</h1>
        </Link>
        <SheetTrigger asChild>
          <Button variant="transparant" size="icon">
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle></SheetTitle>
        <div className="overflow-auto p-6">
          <div className="flex flex-col gap-4 items-center">
            <MobileLink href="/" onOpenChange={setOpen}>
              Home
            </MobileLink>
            <MobileLink href="/editor" onOpenChange={setOpen}>
              Editor
            </MobileLink>
            <MobileLink href="/my-creatures" onOpenChange={setOpen}>
              My Creatures
            </MobileLink>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn("text-xl font-medium", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
