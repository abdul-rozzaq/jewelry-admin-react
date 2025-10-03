import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { useGetOrganizationByIdQuery, useGetOrganizationTransactionsQuery } from "@/src/lib/service/organizationsApi";

import GeneralBarChart from "./charts/GeneralBarChart";
import MaterialsPieChart from "./charts/MaterialsPieChart";

import type { Transaction, TransactionItem } from "@/src/types/transactions";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

function getStartDate(timeline) {
  const today = new Date();
  let start: Date | null = null;

  switch (timeline) {
    case "today":
      start = today;
      break;
    case "7days":
      start = new Date();
      start.setDate(today.getDate() - 7);
      break;
    case "30days":
      start = new Date();
      start.setDate(today.getDate() - 30);
      break;
    case "all":
      start = null;
      break;
  }

  return start ? start.toISOString().split("WorkshopDetailPage.T")[0] : undefined;
}

export default function WorkshopDetailPage() {
  const { t } = useTranslation();

  const timeLines = ["today", "7days", "30days", "all"];
  const [timeline, setTimeline] = useState("all");

  const params = useParams();
  const organizationId = params.id as string;

  const startDate = getStartDate(timeline);

  const { data: organization, isLoading, error, refetch } = useGetOrganizationByIdQuery(organizationId);
  const { data: transactions = [], isLoading: transactionsLoading } = useGetOrganizationTransactionsQuery({
    id: organizationId,
    start_date: startDate,
  });

  const materialHistory = [
    {
      id: "1",
      date: "2024-01-25 09:30",
      action: t("WorkshopDetailPage.actions.received"),
      material: "250gr " + t("WorkshopDetailPage.materials.gold"),
      from: "Safe",
      status: "received",
    },
    {
      id: "2",
      date: "2024-01-24 16:45",
      action: t("WorkshopDetailPage.actions.sent"),
      material: "180gr " + t("WorkshopDetailPage.materials.silver"),
      to: "Atolye-2",
      status: "sent",
    },
    {
      id: "3",
      date: "2024-01-24 14:20",
      action: t("WorkshopDetailPage.actions.processed"),
      material: "200gr " + t("WorkshopDetailPage.materials.silver") + " → 180gr " + t("WorkshopDetailPage.materials.silver"),
      note: t("WorkshopDetailPage.sections.materialHistory.processNote"),
      status: "processed",
    },
  ];

  const generalStats = transactions.reduce((acc, tx: Transaction) => {
    const created_at = tx.created_at.split("WorkshopDetailPage.T")[0];

    acc[created_at] = acc[created_at] ?? { received: 0, sent: 0, name: created_at, date: created_at };

    tx.items.forEach((item) => {
      const qty = parseFloat(item.quantity);

      if (tx.receiver.id === +organizationId) {
        acc[created_at].received += qty;
      } else if (tx.sender.id === +organizationId) {
        acc[created_at].sent += qty;
      }
    });

    return acc;
  }, {});

  const materialStats = transactions.reduce((acc, tx: Transaction) => {
    tx.items.forEach((item: TransactionItem) => {
      const name = item.product.material.name;
      const qty = parseFloat(item.quantity);
      acc[name] = (acc[name] || 0) + qty;
    });
    return acc;
  }, {} as Record<string, number>);

  const materialData = Object.entries(materialStats).map(([name, value]) => ({
    name,
    value,
  }));

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>{t("WorkshopDetailPage.loading.text")}</span>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">{t("WorkshopDetailPage.errors.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("WorkshopDetailPage.errors.loadWorkshopFailed")}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => refetch()} variant="outline">
                {t("WorkshopDetailPage.buttons.tryAgain")}
              </Button>
              <Link to="/organizations">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-0.5" />
                  {t("WorkshopDetailPage.buttons.goBack")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-0.5" />
            {t("WorkshopDetailPage.buttons.back")}
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-balance">{organization.name}</h1>
          <p className="text-muted-foreground">{t("WorkshopDetailPage.header.description")}</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive cursor-pointer">
                <Trash2 className="h-4 w-4" />
                <div>{t("WorkshopDetailPage.buttons.delete")}</div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("WorkshopDetailPage.dialogs.delete.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("WorkshopDetailPage.dialogs.delete.description", {
                    name: organization.name,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("WorkshopDetailPage.buttons.cancel")}</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("WorkshopDetailPage.buttons.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Timeline Filter */}
      <div className="flex gap-2">
        {timeLines.map((range) => (
          <Button key={range} size="sm" variant={timeline === range ? "default" : "outline"} onClick={() => setTimeline(range)}>
            {t(`WorkshopDetailPage.filters.${range}`)}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("WorkshopDetailPage.charts.generalTitle")}</CardTitle>
            <CardDescription>{t("WorkshopDetailPage.charts.generalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="h-96">{!transactionsLoading && <GeneralBarChart t={t} generalData={Object.values(generalStats)} />}</CardContent>
        </Card>

        {/* Material Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("WorkshopDetailPage.charts.materialTitle")}</CardTitle>
            <CardDescription>{t("WorkshopDetailPage.charts.materialDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex justify-center items-center">
            {!transactionsLoading && <MaterialsPieChart materialData={materialData} />}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("WorkshopDetailPage.sections.materialHistory.title")}</CardTitle>
          <CardDescription>{t("WorkshopDetailPage.sections.materialHistory.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("WorkshopDetailPage.sections.materialHistory.headers.date")}</TableHead>
                <TableHead>{t("WorkshopDetailPage.sections.materialHistory.headers.material")}</TableHead>
                <TableHead>{t("WorkshopDetailPage.sections.materialHistory.headers.action")}</TableHead>
                <TableHead>{t("WorkshopDetailPage.sections.materialHistory.headers.note")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialHistory.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.material}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "received" ? "default" : tx.status === "sent" ? "secondary" : "outline"}>{tx.action}</Badge>
                  </TableCell>
                  <TableCell>{tx.note || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
