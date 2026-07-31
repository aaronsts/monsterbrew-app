import Markdown from "react-markdown";
import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { slugify } from "@/lib/guide";
import { cn } from "@/lib/utils";

function headingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(headingText).join("");
  return "";
}

function MarkdownLink({
  node: _node,
  href,
  children,
  ...props
}: ComponentProps<"a"> & { node?: unknown }) {
  if (href?.startsWith("/")) {
    const [pathAndQuery, hash] = href.split("#");
    const [path, query] = pathAndQuery.split("?");
    const linkProps = {
      to: path,
      ...(hash ? { hash } : {}),
      ...(query
        ? { search: Object.fromEntries(new URLSearchParams(query)) }
        : {}),
    } as LinkProps;
    return (
      <Link {...linkProps} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

interface GuideMarkdownProps {
  children?: string;
  className?: string;
}

export function GuideMarkdown({
  children,
  className,
}: Readonly<GuideMarkdownProps>) {
  return (
    <div
      className={cn(
        "prose max-w-none",
        "[--tw-prose-body:var(--foreground)] [--tw-prose-headings:var(--foreground)]",
        "[--tw-prose-bold:var(--foreground)] [--tw-prose-links:var(--accent)]",
        "[--tw-prose-bullets:var(--accent)] [--tw-prose-counters:var(--muted-foreground)]",
        "[--tw-prose-quotes:var(--foreground)] [--tw-prose-quote-borders:var(--accent)]",
        "[--tw-prose-hr:var(--border)] [--tw-prose-code:var(--foreground)]",
        "prose-a:underline-offset-4 prose-headings:tracking-tight",
        className,
      )}
    >
      <Markdown
        components={{
          h2: ({ node: _node, children: headingChildren, ...props }) => (
            <h2
              id={slugify(headingText(headingChildren))}
              className="scroll-mt-24"
              {...props}
            >
              {headingChildren}
            </h2>
          ),
          h3: ({ node: _node, children: headingChildren, ...props }) => (
            <h3
              id={slugify(headingText(headingChildren))}
              className="scroll-mt-24"
              {...props}
            >
              {headingChildren}
            </h3>
          ),
          a: MarkdownLink,
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
