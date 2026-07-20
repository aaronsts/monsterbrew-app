import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

export function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Card className="relative">
      {badge && (
        <Badge variant="secondary" className="absolute top-4 right-4">
          {badge}
        </Badge>
      )}
      <CardHeader>
        <div className="mb-1 flex size-11 items-center justify-center bg-accent/10 text-accent ring-1 ring-accent/25 [&_svg]:size-5">
          {icon}
        </div>
        <p>{title}</p>
      </CardHeader>
      <CardContent>
        <p className="text-base">{description}</p>
      </CardContent>
    </Card>
  );
}
