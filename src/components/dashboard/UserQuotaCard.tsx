import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";

interface UserQuotaCardProps {
  quotaRemaining: number;
  quotaLimit: number;
  subscriptionTier: string;
  quotaResetAt: string;
}

export function UserQuotaCard({ 
  quotaRemaining, 
  quotaLimit, 
  subscriptionTier,
  quotaResetAt 
}: UserQuotaCardProps) {
  const percentageUsed = ((quotaLimit - quotaRemaining) / quotaLimit) * 100;
  const resetDate = new Date(quotaResetAt);
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'enterprise': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default: return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">API Usage</CardTitle>
          <Badge className={getTierColor(subscriptionTier)}>
            {subscriptionTier.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          Monthly analysis quota
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold">{quotaRemaining} / {quotaLimit}</span>
          </div>
          <Progress value={100 - percentageUsed} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Used</p>
              <p className="font-medium">{quotaLimit - quotaRemaining}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Resets in</p>
              <p className="font-medium">{daysUntilReset} days</p>
            </div>
          </div>
        </div>

        {quotaRemaining <= 2 && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Running low on quota. Consider upgrading for more analyses.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
