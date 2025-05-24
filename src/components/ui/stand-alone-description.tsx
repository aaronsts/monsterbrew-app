import Markdown from "react-markdown";

interface DescriptionProps extends Partial<HTMLParagraphElement> {
  title: string;
  description: string | number;
  show?: boolean;
  placeholder?: string;
}

export function StandAloneDescription({
  title,
  description,
  show = true,
  className,
  placeholder = "",
}: DescriptionProps) {
  if (!show) return null;

  const markdownString = `***${title}.*** ${description || placeholder}`;

  return (
    <div className="whitespace-normal">
      <Markdown
        components={{
          strong: ({ node, ...props }) => (
            <strong className="font-semibold pr-1" {...props} />
          ),
        }}
      >
        {markdownString}
      </Markdown>
    </div>
  );
}
