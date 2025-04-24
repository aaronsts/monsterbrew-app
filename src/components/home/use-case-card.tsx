import { Card, CardContent, CardHeader } from "../ui/card";

export function UseCaseCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">{icon}</div>
        <div>{title}</div>
      </CardHeader>
      <CardContent>
        <p className="text-base">{description}</p>
      </CardContent>
    </Card>
  );
}
