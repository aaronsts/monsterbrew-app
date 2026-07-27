import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import SrdDetail from "@/app/library/components/srd-detail";
import { Button } from "@/components/ui/button";
import { SITE_URL, seo } from "@/lib/seo";
import { titleCase } from "@/lib/utils";

export const Route = createFileRoute("/library/srd/$key")({
  loader: async ({ params }) => {
    const { getSrdMonster } = await import("@/services/srd");
    const entry = getSrdMonster(params.key);
    if (!entry) throw notFound();
    const { name, size, type, alignment, armor_class, hit_points, cr } =
      entry.monster;
    return {
      name,
      size,
      type,
      alignment,
      armorClass: armor_class,
      hitPoints: hit_points,
      challengeRating: cr.challenge_rating,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const monster = loaderData;
    const path = `/library/srd/${params.key}`;
    const title = `${monster.name} – CR ${monster.challengeRating} ${titleCase(monster.size)} ${titleCase(monster.type)} | Monsterbrew`;
    const description = `${monster.name}: CR ${monster.challengeRating} ${monster.size.toLowerCase()} ${monster.type.toLowerCase()}${monster.alignment ? ` (${monster.alignment.toLowerCase()})` : ""}, AC ${monster.armorClass}, ${monster.hitPoints} HP. Full D&D 5e statblock from the 2024 SRD. View it or copy it into Monsterbrew's free statblock editor.`;
    const { meta, links } = seo({ title, description, path });
    return {
      meta,
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Monster Library",
                    item: `${SITE_URL}/library`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: monster.name,
                    item: `${SITE_URL}${path}`,
                  },
                ],
              },
              {
                "@type": "CreativeWork",
                name: `${monster.name} – D&D 5e statblock`,
                url: `${SITE_URL}${path}`,
                description,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Monsterbrew",
                  url: SITE_URL,
                },
                about: {
                  "@type": "Thing",
                  name: monster.name,
                  description: `${monster.size} ${monster.type} from the D&D 2024 System Reference Document`,
                },
                license:
                  "https://creativecommons.org/licenses/by/4.0/legalcode",
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: SrdNotFound,
  component: SrdDetailPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function SrdNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p>SRD monster not found.</p>
      <Link to="/library" search={{ source: "srd" }}>
        <Button color="neutral" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to library
        </Button>
      </Link>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function SrdDetailPage() {
  return <SrdDetail />;
}
