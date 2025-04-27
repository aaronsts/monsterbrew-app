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
        <div className="[&_svg]:size-8">{icon}</div>
        <p>{title}</p>
      </CardHeader>
      <CardContent>
        <p className="text-base">{description}</p>
      </CardContent>
    </Card>
  );
}
