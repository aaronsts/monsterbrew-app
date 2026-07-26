import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpenText, ScrollText, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CornerBrackets } from "@/components/home/corner-brackets";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/legal")({
  head: () => ({
    ...seo({
      title: "Licenses & Attribution | Monsterbrew",
      description:
        "Licensing information for Monsterbrew: SRD 5.2.1 Creative Commons attribution, trademark disclaimers, and ownership of your homebrew creatures.",
      path: "/legal",
    }),
  }),
  component: Legal,
});

type Section = {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
};

const sections: Array<Section> = [
  {
    icon: <BookOpenText />,
    title: "SRD Attribution",
    body: (
      <div className="flex flex-col gap-3 text-muted-foreground">
        <p>
          The monsters in the SRD section of the library are reproduced from
          the System Reference Document, reformatted for display in
          Monsterbrew.
        </p>
        {/* Wording mandated by the CC-BY-4.0 grant; keep the sentence verbatim. */}
        <p>
          This work includes material from the System Reference Document 5.2.1
          (&ldquo;SRD 5.2.1&rdquo;) by Wizards of the Coast LLC, available at{" "}
          <a
            href="https://www.dndbeyond.com/srd"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            https://www.dndbeyond.com/srd
          </a>
          . The SRD 5.2.1 is licensed under the Creative Commons Attribution
          4.0 International License, available at{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/legalcode"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            https://creativecommons.org/licenses/by/4.0/legalcode
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    icon: <Users />,
    title: "Creature Building Guide Sources",
    body: (
      <div className="flex flex-col gap-3 text-muted-foreground">
        <p>
          The <Link to="/guide" className="text-primary underline underline-offset-4">creature building guide</Link>{" "}
          adapts openly licensed community material.
        </p>
        {/* Wording mandated by the CC-BY-4.0 grant; keep the sentence verbatim. */}
        <p>
          This work includes material taken from the Lazy GM&rsquo;s 5e Monster
          Builder Resource Document written by Teos Abadía of{" "}
          <a
            href="https://alphastream.org"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Alphastream.org
          </a>
          , Scott Fitzgerald Gray of{" "}
          <a
            href="https://insaneangel.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Insaneangel.com
          </a>
          , and Michael E. Shea of{" "}
          <a
            href="https://slyflourish.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            SlyFlourish.com
          </a>
          , available under a Creative Commons Attribution 4.0 International
          License.
        </p>
        <p>
          The guide also draws on &ldquo;The 2024 Monster Manual on a business
          card&rdquo; by Paul Hughes of{" "}
          <a
            href="https://www.blogofholding.com/?p=8469"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Blog of Holding
          </a>{" "}
          (CC-BY 4.0). See the guide&rsquo;s{" "}
          <Link
            to="/guide/$slug"
            params={{ slug: "sources" }}
            className="text-primary underline underline-offset-4"
          >
            sources &amp; attribution
          </Link>{" "}
          chapter for the full credits.
        </p>
      </div>
    ),
  },
  {
    icon: <ShieldCheck />,
    title: "Trademarks",
    body: (
      <p className="text-muted-foreground">
        Monsterbrew is an independent project and is not affiliated with,
        endorsed, sponsored, or specifically approved by Wizards of the Coast
        LLC. Dungeons &amp; Dragons and D&amp;D are trademarks of Wizards of
        the Coast LLC, used here only to describe compatibility.
      </p>
    ),
  },
  {
    icon: <ScrollText />,
    title: "Your Creatures",
    body: (
      <p className="text-muted-foreground">
        The homebrew creatures you build are yours. They are stored locally in
        your browser, and Monsterbrew claims no rights over anything you
        create, import, or export.
      </p>
    ),
  },
];

// eslint-disable-next-line react-refresh/only-export-components
function Legal() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8">
      {/* Header */}
      <section className="relative flex flex-col items-center gap-4 px-4 py-16 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_45%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <CornerBrackets size="size-8" />
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
          <span aria-hidden className="size-1.5 bg-primary" />
          Legal
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Licenses &amp; Attribution
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          Where the official monster content comes from, and what that means
          for you.
        </p>
      </section>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="relative">
            <CardHeader>
              <div className="mb-1 flex size-11 items-center justify-center bg-accent/10 text-accent ring-1 ring-accent/25 [&_svg]:size-5">
                {section.icon}
              </div>
              <h2 className="mb-0 text-xl font-semibold">{section.title}</h2>
            </CardHeader>
            <CardContent>{section.body}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
