import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
};

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-100 dark:bg-primary-700",
  iconColor = "text-primary-600 dark:text-primary-100"
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn("h-5 w-5", iconColor)
            })}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
