import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Search, Eye, CheckCircle, Clock, XCircle, ArrowLeftRight, Loader2, Plus, Building2 } from "lucide-react";
import { useGetTransactionsQuery } from "@/src/lib/service/transactionsApi";
import type Organization from "@/src/types/organization";
import { useGetOrganizationsQuery } from "@/src/lib/service/organizationsApi";
import type { Transaction, TransactionItem } from "@/src/types/transactions";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// status badge function
const getStatusBadge = (status: string, t: any) => {
  switch (status) {
    case "accepted":
    case "confirmed":
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t("transfers.status.accepted")}
        </Badge>
      );
    case "pending":
    case "pending_sender":
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          {t("transfers.status.pending")}
        </Badge>
      );

    default:
      return <Badge variant="secondary">{t("transfers.status.unknown")}</Badge>;
  }
};

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");

  const {
    data: transfers = [] as Transaction[],
    isLoading,
    error,
    refetch,
  } = useGetTransactionsQuery({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: organizations = [] } = useGetOrganizationsQuery({});

  const filteredTransfers = transfers.filter((transfer: Transaction) => {
    const matchesSearch =
      transfer.id.toString().includes(searchTerm.toLowerCase()) ||
      transfer.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;

    const matchesOrganization =
      organizationFilter === "all" || transfer.receiver.id.toString() === organizationFilter || transfer.sender.id.toString() === organizationFilter;

    return matchesSearch && matchesStatus && matchesOrganization;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" });

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t("transfers.title")}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("transfers.subtitle")}</p>
          </div>
          <Button asChild size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
            <Link to="/transactions/create">+ {t("transfers.new")}</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-red-500 mb-4">{t("transfers.error")}</p>
              <Button onClick={() => refetch()} size="sm" className="text-xs sm:text-sm">
                {t("transfers.retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("transfers.title")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("transfers.subtitle")}</p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
          <Link to="/transactions/create">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> {t("transfers.new")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("transfers.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:pl-10 w-full text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-0 flex-wrap sm:flex-nowrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
              <SelectValue placeholder={t("transfers.filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("transfers.filters.all")}</SelectItem>
              <SelectItem value="pending">{t("transfers.filters.pending")}</SelectItem>
              <SelectItem value="accepted">{t("transfers.filters.accepted")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
              <SelectValue placeholder={t("transfers.filters.organization")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("transfers.filters.all")}</SelectItem>
              {organizations.map((organization: Organization) => (
                <SelectItem key={organization.id} value={organization.id.toString()}>
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">{t("transfers.list.title")}</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            {isLoading ? t("transfers.loading") : t("transfers.list.total", { count: transfers.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6 sm:p-8">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
              <span className="text-xs sm:text-sm">{t("transfers.loading")}</span>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="space-y-3 sm:hidden">
                {filteredTransfers.length > 0 ? (
                  filteredTransfers.map((tr: Transaction) => buildTransactionRowForMobile(tr, t, formatDate))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {searchTerm || statusFilter !== "all" ? t("transfers.empty.search") : t("transfers.empty.default")}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("transfers.table.from")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("transfers.table.to")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("transfers.table.materials")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("transfers.table.status")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("transfers.table.date")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("transfers.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfers.length > 0 ? (
                      filteredTransfers.map((tr: Transaction) => buildTransactionRowForDesktop(tr, t, formatDate))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-xs sm:text-sm text-gray-500">
                            {searchTerm || statusFilter !== "all" ? t("transfers.empty.search") : t("transfers.empty.default")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function buildTransactionRowForMobile(tr: Transaction, t: any, formatDate: (iso: string) => string) {
  return (
    <Card key={tr.id} className="overflow-hidden">
      <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">ID</p>
              <p className="font-mono font-medium text-sm sm:text-base">#{tr.id}</p>
            </div>
            <div className="text-right">{getStatusBadge(tr.status, t)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("transfers.table.from")}</p>
              <p className="font-medium text-xs sm:text-sm truncate">{tr.sender.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("transfers.table.to")}</p>
              <p className="font-medium text-xs sm:text-sm truncate">{tr.receiver.name}</p>
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t("transfers.table.materials")}</p>
            {tr.items && tr.items.length > 0 ? (
              <div className="space-y-1">
                {tr.items.map((it: TransactionItem) => (
                  <div key={it.id} className="flex justify-between items-center text-xs sm:text-sm p-2 rounded bg-muted/50">
                    <span className="truncate">{it.product.material.name}</span>
                    <span className="font-mono ml-2 flex-shrink-0">
                      {it.quantity} {it.product.material.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-gray-500">{t("transfers.table.noData")}</span>
            )}
          </div>

          <div className="pt-1 sm:pt-2 border-t">
            <p className="text-xs sm:text-sm text-muted-foreground">{t("transfers.table.date")}</p>
            <p className="text-xs sm:text-sm font-medium">{formatDate(tr.created_at)}</p>
          </div>

          <Button asChild variant="default" size="sm" className="w-full mt-2 text-xs sm:text-sm">
            <Link to={`/transactions/${tr.id}`}>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> {t("transfers.table.actions")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function buildTransactionRowForDesktop(tr: Transaction, t: any, formatDate: (iso: string) => string) {
  return (
    <TableRow key={tr.id}>
      <TableCell className="font-mono text-xs sm:text-sm">#{tr.id}</TableCell>
      <TableCell className="text-xs sm:text-sm">{tr.sender.name}</TableCell>
      <TableCell className="text-xs sm:text-sm">{tr.receiver.name}</TableCell>
      <TableCell>
        {tr.items && tr.items.length > 0 ? (
          <ul className="space-y-1">
            {tr.items.map((it: TransactionItem) => (
              <li key={it.id} className="text-xs sm:text-sm flex justify-between">
                <span>{it.product.material.name}</span>
                <span className="font-mono">
                  {it.quantity} {it.product.material.unit}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs sm:text-sm text-gray-500">{t("transfers.table.noData")}</span>
        )}
      </TableCell>
      <TableCell>{getStatusBadge(tr.status, t)}</TableCell>
      <TableCell className="text-xs sm:text-sm">{formatDate(tr.created_at)}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/transactions/${tr.id}`}>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
