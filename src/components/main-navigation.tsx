import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";

export default function MainNavigation() {
  return (
    <header className="max-w-8xl mx-auto p-3 pb-0 w-full">
      <div className="bg-card text-card-foreground w-full flex justify-between items-center border p-2 rounded-xl shadow-sm flex-col sm:flex-row gap-3">
        <Link href="/">
          <h1 className="text-2xl font-bold pl-4">Monsterbrew</h1>
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="flex flex-col sm:flex-row gap-3">
            <NavigationMenuItem>
              <Link href="/">Home</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/editor">Editor</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/my-creatures">My Creatures</Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
