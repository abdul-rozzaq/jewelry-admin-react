import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Transaction } from "@/src/types/transactions";

export default function QuickApprovalTransfers({ data, isLoading }: { data?: Transaction[]; isLoading?: boolean }) {
  const { t } = useTranslation();
  const pendingTransactions: Transaction[] = data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickApproval.title")}</CardTitle>
          <CardDescription>{t("dashboard.quickApproval.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-2">
      <CardHeader className="pb-3 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">{t("dashboard.quickApproval.title")}</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">{t("dashboard.quickApproval.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-3 opacity-50" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.quickApproval.noPending")}</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {pendingTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 border rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {transaction.sender.name} → {transaction.receiver.name}
                    </p>
                    <Badge variant="secondary" className="text-xs w-fit">
                      {transaction.items.length} {t("dashboard.quickApproval.items")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}{" "}
                    {new Date(transaction.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Link to={`/transactions/${transaction.id}`} className="w-full sm:w-auto">
                  <Button size="sm" variant="default" className="w-full sm:w-auto text-xs sm:text-sm">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{t("dashboard.quickApproval.approve")}</span>
                    <span className="sm:hidden">{t("dashboard.quickApproval.approve")}</span>
                  </Button>
                </Link>
              </div>
            ))}

            {pendingTransactions.length > 5 && (
              <Link to="/transactions?status=pending" className="block">
                <Button variant="outline" className="w-full mt-2 sm:mt-3 text-xs sm:text-sm">
                  {t("dashboard.quickApproval.viewAll")} ({pendingTransactions.length})
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
