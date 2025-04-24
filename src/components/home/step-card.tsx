export function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start text-center">
      <div className="size-16 border rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold mb-6">
        {number}
      </div>
      <div className="flex-1 text-left md:mt-3">
        <h3 className="leading-normal md:leading-none font-bold mb-3">
          {title}
        </h3>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
}
