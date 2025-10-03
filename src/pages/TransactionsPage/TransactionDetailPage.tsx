import type React from "react";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, Clock, ArrowRight, AlertTriangle, Calendar, User, Building2, University, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGetTransactionByIdQuery, useAcceptTransactionMutation } from "@/src/lib/service/transactionsApi";
import { toast } from "@/src/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { TransactionItem } from "@/src/types/transactions";

const StatusBadge = ({ status, t }: { status: string; t: any }) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";

  switch (status) {
    case "confirmed":
    case "accepted":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          {t("TransferDetail.status.confirmed")}
        </span>
      );
    case "pending":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <Clock className="w-3 h-3 mr-1" />
          {t("TransferDetail.status.pending")}
        </span>
      );
    case "rejected":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <XCircle className="w-3 h-3 mr-1" />
          {t("TransferDetail.status.rejected")}
        </span>
      );
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{t("TransferDetail.status.unknown")}</span>;
  }
};

const OrganizationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "bank":
      return <University className="w-5 h-5" />;
    case "atolye":
      return <Building2 className="w-5 h-5" />;
    default:
      return <User className="w-5 h-5" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();

  const transactionId = params.id as string;

  const { data: transactionDetail, isLoading, error, refetch } = useGetTransactionByIdQuery(transactionId);

  const [acceptTransaction, { isLoading: isAccepting }] = useAcceptTransactionMutation();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [formError, setFormError] = useState("");

  const handleConfirmTransfer = async () => {
    try {
      const payload = {
        id: transactionId,
        note: "",
        items: transactionDetail.items.map((item: any) => ({
          inventory_id: item.inventory.id,
          received_quantity: item.quantity,
        })),
      };

      await acceptTransaction(payload).unwrap();

      toast({
        title: t("TransferDetail.success.title"),
        description: t("TransferDetail.success.transferConfirmed"),
      });

      setIsConfirmDialogOpen(false);
      refetch();
    } catch (err: any) {
      const errorMessage = err?.data?.detail || err?.data?.message || t("TransferDetail.errors.transferConfirmError");

      toast({
        title: t("TransferDetail.errors.title"),
        description: errorMessage,
        variant: "destructive",
      });

      setIsConfirmDialogOpen(false);
    }
  };

  const handleRejectTransfer = async () => {
    if (!rejectNote.trim()) {
      setFormError(t("TransferDetail.errors.rejectReasonRequired"));
      return;
    }

    setFormError("");
  };

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  const isSender = user?.organization?.id === transactionDetail?.sender?.id;
  const canConfirm = transactionDetail?.status === "pending" && !isSender;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold  text-lg">{t("TransferDetail.loading.title")}</h3>
            <p className="text-gray-500">{t("TransferDetail.loading.description")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t("TransferDetail.errors.errorOccurred")}</h2>
            <p className="text-gray-600 mb-4">{t("TransferDetail.errors.transferLoadError")}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate("/transactions")}>
                {t("TransferDetail.actions.back")}
              </Button>
              <Button onClick={() => refetch()}>{t("TransferDetail.actions.retry")}</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!transactionDetail) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">{t("TransferDetail.errors.transferNotFound")}</h2>
            <p className="text-gray-600 mb-4">{t("TransferDetail.errors.transferNotFoundDesc")}</p>
            <Button onClick={() => navigate("/transactions")}>{t("TransferDetail.actions.back")}</Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalOriginalAmount = transactionDetail.items?.reduce((sum: number, item: any) => sum + Number.parseFloat(item.quantity), 0) || 0;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => navigate("/transactions")}>
                <ArrowLeft className="w-4 h-4" />
                {t("TransferDetail.actions.back")}
              </Button>

              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <h1 className="text-2xl font-semibold ">{t("TransferDetail.header.title", { id: transactionDetail.id })}</h1>
                <StatusBadge status={transactionDetail.status} t={t} />
              </div>
            </div>

            {canConfirm && (
              <Button onClick={() => setIsConfirmDialogOpen(true)} disabled={isAccepting} className="bg-green-600 hover:bg-green-700 md:w-auto">
                {isAccepting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {t("TransferDetail.actions.confirm")}
              </Button>
            )}
          </div>
        </div>

        {/* <div className="not-dark:bg-white rounded-lg border  p-6">
          <h2 className="text-lg font-medium mb-6">{t("TransferDetail.sections.transferDirection")}</h2>

          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <OrganizationIcon type={transferDetail.sender.type} />
              </div>
              <h3 className="font-medium text-gray-900">{transferDetail.sender.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{transferDetail.sender.type}</p>
            </div>

            <div className="px-8">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <OrganizationIcon type={transferDetail.receiver.type} />
              </div>
              <h3 className="font-medium text-gray-900">{transferDetail.receiver.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{transferDetail.receiver.type}</p>
            </div>
          </div>
        </div> */}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-4">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-medium mb-4">{t("TransferDetail.sections.sentMaterials")}</h2>

              <div className="space-y-3">
                {transactionDetail.items.map((item: TransactionItem) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium ">{item.product.material.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("TransferDetail.labels.sender")}: {item.product.organization.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {item.quantity} {item.product.material.unit}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {t("TransferDetail.labels.available")}: {item.product.quantity} {item.product.material.unit}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>{t("TransferDetail.labels.total")}:</span>
                    <span>{totalOriginalAmount.toFixed(3)} g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-medium mb-4">{t("TransferDetail.sections.information")}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("TransferDetail.labels.id")}</p>
                  <p className="font-mono">#{transactionDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("TransferDetail.labels.created")}</p>
                  <p className="text-sm">{formatDate(transactionDetail.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("TransferDetail.labels.updated")}</p>
                  <p className="text-sm">{formatDate(transactionDetail.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("TransferDetail.labels.status")}</p>
                  <StatusBadge status={transactionDetail.status} t={t} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isConfirmDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => !isAccepting && setIsConfirmDialogOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              {isAccepting ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t("TransferDetail.dialogs.confirming.title")}</h3>
                  <p className="text-gray-600">{t("TransferDetail.dialogs.confirming.description")}</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-900 mb-2">{t("TransferDetail.dialogs.confirmTransfer.title")}</h2>
                    <p className="text-gray-600">{t("TransferDetail.dialogs.confirmTransfer.description")}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} className="flex-1">
                      {t("TransferDetail.actions.cancel")}
                    </Button>
                    <Button onClick={handleConfirmTransfer} className="flex-1 bg-green-600 hover:bg-green-700">
                      {t("TransferDetail.actions.confirm")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
