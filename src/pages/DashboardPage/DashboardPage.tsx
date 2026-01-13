import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Gem, Factory, TrendingUp, Clock, AlertTriangle, Plus, Eye, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

import { useGetStatsQuery } from "@/src/lib/service/dashboardApi";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import QuickApprovalTransfers from "@/src/components/QuickApprovalTransfers";

export default function DashboardPage() {
  const { t } = useTranslation();

  const { data, isLoading } = useGetStatsQuery();

  // Recent activities with translations
  const recentActivities = [
    {
      id: 1,
      type: "transfer",
      message: t("dashboard.activities.examples.transfer"),
      time: t("dashboard.activities.times.5minAgo"),
      status: "pending",
    },
    {
      id: 2,
      type: "completion",
      message: t("dashboard.activities.examples.completion"),
      time: t("dashboard.activities.times.15minAgo"),
      status: "completed",
    },
    {
      id: 3,
      type: "alert",
      message: t("dashboard.activities.examples.alert"),
      time: t("dashboard.activities.times.1hAgo"),
      status: "alert",
    },
  ];

  const weekdayNames = {
    1: t("dashboard.weekdays.mon"),
    2: t("dashboard.weekdays.tue"),
    3: t("dashboard.weekdays.wed"),
    4: t("dashboard.weekdays.thu"),
    5: t("dashboard.weekdays.fri"),
    6: t("dashboard.weekdays.sat"),
    7: t("dashboard.weekdays.sun"),
  };

  // Mock data for charts
  const materialData = [
    { name: t("dashboard.materials.gold"), amount: 2500, unit: "gr" },
    { name: t("dashboard.materials.silver"), amount: 5200, unit: "gr" },
    { name: t("dashboard.materials.diamond"), amount: 45, unit: "dona" },
    { name: t("dashboard.materials.pearl"), amount: 120, unit: "dona" },
  ];

  const weeklyTransfers = data
    ? data.transactions.last_week.map((item) => ({
        ...item,
        weekday: weekdayNames[item.weekday],
      }))
    : [];

  const workshopStatus = [
    { name: t("dashboard.workshopStates.active"), value: 8, color: "#059669" },
    { name: t("dashboard.workshopStates.busy"), value: 3, color: "#f59e0b" },
    { name: t("dashboard.workshopStates.stopped"), value: 2, color: "#dc2626" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-0.5" />
            {t("dashboard.report")}
          </Button>
          <Link to="/transactions/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-0.5" />
              {t("dashboard.newTransfer")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalMaterials")}</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{Number(data?.products.total ?? 0).toLocaleString()} g</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalGoldAmount")}</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{Number(data?.gold.total ?? 0).toLocaleString()} g</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{"Oylik yo'qotishlar"}</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{Number(data?.loses.total ?? 0).toLocaleString()} g</div>
            )}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.todayTransfers")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : <div className="text-2xl font-bold"> {data?.transactions.count} </div>}
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.pending")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>{isLoading ? <Skeleton className="h-6 w-10" /> : <div className="text-2xl font-bold">{ data?.organizations.count }</div>}</CardContent>
        </Card> */}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Material Inventory Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.materialsInventory")}</CardTitle>
            <CardDescription>{t("dashboard.charts.materialsInventoryDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Transfers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.weeklyTransfers")}</CardTitle>
            <CardDescription>{t("dashboard.charts.weeklyTransfersDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTransfers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekday" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Approval Transfers */}
        <div className="md:col-span-3">
          <QuickApprovalTransfers />
        </div>
      </div>
    </div>
  );
}
