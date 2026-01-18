import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Search, CheckCircle, Settings, Loader2, SquareCheckBig, Trash2, Plus, Edit } from "lucide-react";
import { useCompleteProcessMutation, useDeleteProcessMutation, useGetProcessesQuery } from "@/src/lib/service/processesApi";
import { useGetProductsQuery } from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import type { Process } from "@/src/types/process";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { toast } from "@/src/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function ProcessesPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [completeOpen, setCompleteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [completeProcess, { isLoading: completing }] = useCompleteProcessMutation();
  const [deleteProcess, { isLoading: deleting }] = useDeleteProcessMutation();

  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  const openCompleteModal = (process: Process) => {
    setSelectedProcess(process);
    setCompleteOpen(true);
  };

  const openDeleteModal = (process: Process) => {
    setSelectedProcess(process);
    setDeleteOpen(true);
  };

  const {
    data: processes = [],
    isLoading,
    error,
    refetch,
  } = useGetProcessesQuery({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: inventory = [] } = useGetProductsQuery({});
  const { data: materials = [] } = useGetMaterialsQuery({});

  const handleComplete = async () => {
    if (!selectedProcess) return;
    try {
      await completeProcess(selectedProcess.id).unwrap();
      toast({
        description: "Jarayon tasdiqlandi ✅",
        variant: "default",
      });
      setCompleteOpen(false);
    } catch (err: any) {
      toast({
        title: t("processes.common.error"),
        description: t(err?.data?.detail || "Noma’lum xato"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedProcess) return;
    try {
      await deleteProcess(selectedProcess.id).unwrap();
      toast({
        description: "Jarayon o'chirildi ✅",
        variant: "default",
      });
      setDeleteOpen(false);
    } catch (err: any) {
      toast({
        title: t("processes.common.error"),
        description: t(err?.data?.detail || "Noma’lum xato"),
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    console.log(status);

    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("processes.status.completed")}
          </Badge>
        );
      case "in process":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Settings className="h-3 w-3 mr-1" />
            {t("processes.status.inProgress")}
          </Badge>
        );
    }
  };

  // Helper function to get inventory item by id
  const getInventoryById = (id: number) => {
    return inventory.find((inv) => inv.id === id);
  };

  // Helper function to get material by id
  const getMaterialById = (id: number) => {
    return materials.find((mat) => mat.id === id);
  };

  const filteredProcesses = processes.filter((process: Process) => {
    const matchesSearch =
      process.id.toString().includes(searchTerm.toLowerCase()) || process.organization.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || process.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" });

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t("processes.title")}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("processes.subtitle")}</p>
          </div>
          <Button asChild size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
            <Link to="/processes/create">+ {t("processes.actions.create")}</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-red-500 mb-4">{t("processes.errors.loadFailed")}</p>
              <Button onClick={() => refetch()} size="sm" className="text-xs sm:text-sm">
                {t("processes.actions.retry")}
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
          <h1 className="text-2xl sm:text-3xl font-bold">{t("processes.title")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("processes.subtitle")}</p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
          <Link to="/processes/create">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> {t("processes.actions.create")}
          </Link>
        </Button>
      </div>

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tasdiqlaysizmi?</DialogTitle>
            <DialogDescription>Ushbu jarayonni tasdiqlashni xohlaysizmi?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompleteOpen(false)}>
              Bekor qilish
            </Button>

            <Button variant="default" disabled={completing} onClick={handleComplete}>
              {completing ? "Tasdiqlanmoqda..." : "Ha, tasdiqlayman"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O‘chirishni xohlaysizmi?</DialogTitle>
            <DialogDescription>Bu amalni ortga qaytarib bo‘lmaydi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "O‘chirilmoqda..." : "O‘chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("processes.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:pl-10 w-full text-xs sm:text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
            <SelectValue placeholder={t("processes.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("processes.filters.all")}</SelectItem>
            <SelectItem value="pending">{t("processes.status.pending")}</SelectItem>
            <SelectItem value="in_progress">{t("processes.status.inProgress")}</SelectItem>
            <SelectItem value="completed">{t("processes.status.completed")}</SelectItem>
            <SelectItem value="cancelled">{t("processes.status.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">{t("processes.table.title")}</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            {isLoading ? t("processes.loading") : t("processes.table.description", { count: processes.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6 sm:p-8">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
              <span className="text-xs sm:text-sm">{t("processes.loading")}</span>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="space-y-3 sm:hidden">
                {filteredProcesses.length > 0 ? (
                  filteredProcesses.map((process: Process, index: number) =>
                    buildProcessRowForMobile(process, index, t, formatDate, getStatusBadge, openCompleteModal, openDeleteModal),
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {searchTerm || statusFilter !== "all" ? t("processes.empty.filtered") : t("processes.empty.noProcesses")}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.id")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.organization")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.inputs")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.outputs")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.totalIn")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.totalOut")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.difference")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.status")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.date")}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t("processes.table.columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcesses.length > 0 ? (
                      filteredProcesses.map((process: Process, index: number) =>
                        buildProcessRowForDesktop(process, index, t, formatDate, getStatusBadge, getMaterialById, openCompleteModal, openDeleteModal),
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <p className="text-xs sm:text-sm text-gray-500">
                            {searchTerm || statusFilter !== "all" ? t("processes.empty.filtered") : t("processes.empty.noProcesses")}
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

function buildProcessRowForMobile(
  process: Process,
  index: number,
  t: any,
  formatDate: (iso: string) => string,
  getStatusBadge: (status: string) => any,
  openCompleteModal: (process: Process) => void,
  openDeleteModal: (process: Process) => void,
) {
  return (
    <Card key={index} className="overflow-hidden">
      <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">ID</p>
              <p className="font-mono font-medium text-sm sm:text-base">#{process.id}</p>
            </div>
            <div className="text-right">{getStatusBadge(process.status)}</div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("processes.table.columns.organization")}</p>
              <p className="font-medium text-xs sm:text-sm">{process.organization.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("processes.table.columns.totalIn")}</p>
              <Badge className="bg-blue-50 text-blue-700 text-xs">{Number(process.total_in).toFixed(3)} g</Badge>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("processes.table.columns.totalOut")}</p>
              <Badge className="bg-green-50 text-green-700 text-xs">{Number(process.total_out).toFixed(3)} g</Badge>
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t("processes.table.columns.inputs")}</p>
            {process.inputs && process.inputs.length > 0 ? (
              <div className="space-y-1">
                {process.inputs.map((input, inputIndex) => {
                  const product = input.product;
                  return (
                    <div key={inputIndex} className="flex justify-between items-center text-xs sm:text-sm p-2 rounded bg-muted/50">
                      <span className="truncate">{product?.material.name ?? input.material?.name}</span>
                      <span className="font-mono ml-2 flex-shrink-0">
                        {input.quantity} {product?.material.unit || ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-gray-500">{t("processes.noData")}</span>
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t("processes.table.columns.outputs")}</p>
            {process.outputs && process.outputs.length > 0 ? (
              <div className="space-y-1">
                {process.outputs.map((output) => (
                  <div key={output.id} className="flex justify-between items-center text-xs sm:text-sm p-2 rounded bg-muted/50">
                    <span className="truncate">{output.material.name || t("processes.unknown")}</span>
                    <span className="font-mono ml-2 flex-shrink-0">
                      {output.quantity} {output.material.unit || ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-gray-500">{t("processes.noData")}</span>
            )}
          </div>

          <div className="pt-1 sm:pt-2 border-t">
            <p className="text-xs sm:text-sm text-muted-foreground">{t("processes.table.columns.date")}</p>
            <p className="text-xs sm:text-sm font-medium">{formatDate(process.created_at)}</p>
          </div>

          {process.status == "in process" && (
            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm" onClick={() => openCompleteModal(process)} className="flex-1 text-xs">
                <SquareCheckBig className="h-3 w-3 mr-1" />
                Tasdiqlash
              </Button>
              <Link to={`/processes/${process.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Tahrir
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => openDeleteModal(process)} className="px-3">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function buildProcessRowForDesktop(
  process: Process,
  index: number,
  t: any,
  formatDate: (iso: string) => string,
  getStatusBadge: (status: string) => any,
  getMaterialById: (id: number) => any,
  openCompleteModal: (process: Process) => void,
  openDeleteModal: (process: Process) => void,
) {
  return (
    <TableRow key={index}>
      <TableCell className="font-mono text-xs sm:text-sm">#{process.id}</TableCell>
      <TableCell className="text-xs sm:text-sm">{process.organization.name}</TableCell>
      <TableCell>
        {process.inputs && process.inputs.length > 0 ? (
          <ul className="space-y-1">
            {process.inputs.map((input, inputIndex) => {
              const product = input.product;
              return (
                <li key={inputIndex} className="text-xs sm:text-sm flex justify-between">
                  <span>{product?.material.name ?? input.material?.name}</span>
                  <span className="font-mono">
                    {input.quantity} {product?.material.unit || ""}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <span className="text-gray-500 text-xs sm:text-sm">{t("processes.noData")}</span>
        )}
      </TableCell>
      <TableCell>
        {process.outputs && process.outputs.length > 0 ? (
          <ul className="space-y-1">
            {process.outputs.map((output) => {
              const material = getMaterialById(output.material.id);
              return (
                <li key={output.id} className="text-xs sm:text-sm flex justify-between">
                  <span>{material?.name || t("processes.unknown")}</span>
                  <span className="font-mono">
                    {output.quantity} {material?.unit || ""}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <span className="text-gray-500 text-xs sm:text-sm">{t("processes.noData")}</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className="bg-blue-50 text-blue-700">{Number(process.total_in).toFixed(3)} g</Badge>
      </TableCell>
      <TableCell>
        <Badge className="bg-green-50 text-green-700">{Number(process.total_out).toFixed(3)} g</Badge>
      </TableCell>
      <TableCell>
        {(() => {
          const diff = Number(process.total_in) - Number(process.total_out);
          const isLoss = diff >= 0;
          return <Badge className={isLoss ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}>{Math.abs(diff).toFixed(3)} g</Badge>;
        })()}
      </TableCell>
      <TableCell>{getStatusBadge(process.status)}</TableCell>
      <TableCell className="text-xs sm:text-sm">{formatDate(process.created_at)}</TableCell>
      <TableCell>
        {process.status == "in process" && (
          <div className="flex gap-2">
            <Button className="cursor-pointer" variant="ghost" size="sm" onClick={() => openCompleteModal(process)}>
              <SquareCheckBig className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Link to={`/processes/${process.id}/edit`}>
              <Button className="cursor-pointer" variant="ghost" size="sm">
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <Button className="cursor-pointer" variant="destructive" size="sm" onClick={() => openDeleteModal(process)}>
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
