import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Search, Eye, CheckCircle, Clock, XCircle, ArrowLeftRight, Loader2, Plus } from "lucide-react";
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
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t("transfers.status.accepted")}
        </Badge>
      );
    case "pending":
    case "pending_sender":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
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
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("transfers.title")}</h1>
            <p className="text-muted-foreground">{t("transfers.subtitle")}</p>
          </div>
          <Button asChild>
            <Link to="/transactions/create">+ {t("transfers.new")}</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{t("transfers.error")}</p>
              <Button onClick={() => refetch()}>{t("transfers.retry")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("transfers.title")}</h1>
          <p className="text-muted-foreground">{t("transfers.subtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/transactions/create">
            <Plus className="h-4 w-4" /> {t("transfers.new")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("transfers.search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("transfers.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("transfers.filters.all")}</SelectItem>
            <SelectItem value="pending">{t("transfers.filters.pending")}</SelectItem>
            <SelectItem value="accepted">{t("transfers.filters.accepted")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
          <SelectTrigger className="w-[200px]">
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

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("transfers.list.title")}</CardTitle>
          <CardDescription>{isLoading ? t("transfers.loading") : t("transfers.list.total", { count: transfers.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{t("transfers.loading")}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("transfers.table.from")}</TableHead>
                  <TableHead>{t("transfers.table.to")}</TableHead>
                  <TableHead>{t("transfers.table.materials")}</TableHead>
                  <TableHead>{t("transfers.table.status")}</TableHead>
                  <TableHead>{t("transfers.table.date")}</TableHead>
                  <TableHead>{t("transfers.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.length > 0 ? (
                  filteredTransfers.map((tr: Transaction) => (
                    <TableRow key={tr.id}>
                      <TableCell className="font-mono">#{tr.id}</TableCell>
                      <TableCell>{tr.sender.name}</TableCell>
                      <TableCell>{tr.receiver.name}</TableCell>
                      <TableCell>
                        {tr.items && tr.items.length > 0 ? (
                          <ul className="space-y-1">
                            {tr.items.map((it: TransactionItem) => (
                              <li key={it.id} className="text-sm flex justify-between">
                                <span>{it.product.material.name}</span>
                                <span className="font-mono">
                                  {it.quantity} {it.product.material.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500 text-sm">{t("transfers.table.noData")}</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(tr.status, t)}</TableCell>
                      <TableCell className="text-sm">{formatDate(tr.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/transactions/${tr.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all" ? t("transfers.empty.search") : t("transfers.empty.default")}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
