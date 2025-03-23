import Image from "next/image";
import beholder from "../components/images/beholder-pixelart.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full grid place-items-center h-full">
      <div className="gap-4 mb-8 flex flex-col items-center justify-center w-fit">
        <div className="mb-4 animate-move ">
          <Image
            src={beholder}
            alt="Dungeons and Dragons Beholder looking down"
            width={250}
            height={250}
          />
        </div>
        <h1 className="text-4xl font-semibold">Welcome to Monsterbrew!</h1>
        <p className="max-w-3xl text-primary/80 text-center">
          Create or customize creatures for Dungeons and Dragons 5th edition (or
          D&D 5e). The goal is to provide an intuitive and user-friendly
          interface that makes it easy for Dungeon Masters to create new and
          unique creatures or tweak existing ones for their campaigns.
        </p>
        <Button>
          <Link href="/editor">Start Homebrewing!</Link>
        </Button>
      </div>
    </div>
  );
}
