export const SITE_URL = "https://monsterbrew.app";

export const SITE_NAME = "Monsterbrew";

type SeoInput = {
  /** Page title, rendered as-is — include the `| Monsterbrew` suffix yourself if wanted. */
  title: string;
  description?: string;
  /** Route pathname starting with "/", used for the canonical URL and og:url. */
  path: string;
  noindex?: boolean;
};

export function seo({ title, description, path, noindex }: SeoInput) {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { property: "og:title", content: title },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      ...(description
        ? [
            { name: "description", content: description },
            { property: "og:description", content: description },
            { name: "twitter:description", content: description },
          ]
        : []),
      ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
