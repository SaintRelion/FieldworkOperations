import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RenderCardProps } from "./render-card-model";

export const RenderCard = ({
  wrapperClass,
  headerTitle,
  headerClass = " font-bold",
  contentClass,
  children,
}: RenderCardProps) => (
  <Card className={wrapperClass}>
    {headerTitle && (
      <CardHeader className={headerClass}>
        <CardTitle>{headerTitle}</CardTitle>
      </CardHeader>
    )}
    <CardContent className={contentClass}>{children}</CardContent>
  </Card>
);
