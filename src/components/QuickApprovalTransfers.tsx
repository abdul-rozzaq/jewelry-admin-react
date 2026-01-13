import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useGetTransactionsQuery } from "@/src/lib/service/transactionsApi";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Transaction } from "@/src/types/transactions";

export default function QuickApprovalTransfers() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetTransactionsQuery({ status: "pending" });

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
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("dashboard.quickApproval.title")}
        </CardTitle>
        <CardDescription>{t("dashboard.quickApproval.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">{t("dashboard.quickApproval.noPending")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {transaction.sender.name} → {transaction.receiver.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.items.length} {t("dashboard.quickApproval.items")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}{" "}
                    {new Date(transaction.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Link to={`/transactions/${transaction.id}`}>
                  <Button size="sm" variant="default">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t("dashboard.quickApproval.approve")}
                  </Button>
                </Link>
              </div>
            ))}

            {pendingTransactions.length > 5 && (
              <Link to="/transactions?status=pending" className="block">
                <Button variant="outline" className="w-full mt-3">
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
