import { EarningsPage as VendorEarningsPage } from "@/features/dashboard/pages/vendor/EarningsPage";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppSelector } from "@/app/hooks";
import {
  earningsBottomGridParentVariants,
  earningsButtonMotionProps,
  earningsCardLiftHover,
  earningsInfoBannerVariants,
  earningsInputFocusClass,
  earningsPageLoadTransition,
  earningsPaymentCardVariants,
  earningsTableRowVariants,
  earningsTableSectionVariants,
  earningsTableStaggerParentVariants,
  earningsTopCardVariants,
  earningsTopStaggerParentVariants,
  earningsWithdrawSectionVariants,
} from "@/features/dashboard/motion/earnings-page-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/utils/utils";

import {
  useGetWalletQuery,
  useGetTransactionsQuery,
  useGetWithdrawRequestsQuery,
  useConnectStripeMutation,
  useCreateWithdrawRequestMutation,
} from "../../services/walletApi";

export function EarningsPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (role === "vendor") {
    return <VendorEarningsPage />;
  }
  return <ServiceProviderEarningsPage />;
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function typeBadgeClass(t: string) {
  return t === "earning" || t === "deposit"
    ? "bg-emerald-600 text-white border-emerald-600"
    : "bg-red-600 text-white border-red-600";
}

function withdrawStatusBadgeClass(s: string) {
  if (s === "approved") return "bg-emerald-600 text-white border-emerald-600";
  if (s === "rejected") return "bg-red-600 text-white border-red-600";
  return "bg-amber-500 text-white border-amber-500";
}

function ServiceProviderEarningsPage() {
  const { data: wallet } = useGetWalletQuery();
  const [connectStripe, { isLoading: isConnecting }] =
    useConnectStripeMutation();
  const [createWithdrawRequest, { isLoading: isWithdrawing }] =
    useCreateWithdrawRequestMutation();

  const totalEarnings = wallet?.totalEarnings ?? 0;
  const availableBalance = wallet?.availableBalance ?? 0;
  const pendingPayout = wallet?.pendingBalance ?? 0;
  const connectedMethod = wallet?.stripeConnect?.payoutsEnabled
    ? "Stripe (Payouts Enabled)"
    : "Stripe (Action Required)";

  const [amount, setAmount] = useState("");
  const [txnSearch, setTxnSearch] = useState("");
  const [withdrawSearch, setWithdrawSearch] = useState("");

  const minWithdraw = 50;
  const amountNumber = useMemo(() => Number(amount), [amount]);
  const canWithdraw =
    Number.isFinite(amountNumber) &&
    amountNumber >= minWithdraw &&
    amountNumber > 0 &&
    amountNumber <= availableBalance;

  async function withdraw() {
    if (!amount.trim()) {
      toast.error("Enter an amount");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amountNumber < minWithdraw) {
      toast.error(`Minimum withdraw: ${fmtMoney(minWithdraw)}`);
      return;
    }
    if (amountNumber > availableBalance) {
      toast.error("Cannot exceed available balance");
      return;
    }

    try {
      await createWithdrawRequest({ amount: amountNumber }).unwrap();
      toast.success("Withdrawal request submitted");
      setAmount("");
    } catch {
      toast.error("Failed to submit withdrawal request");
    }
  }

  async function handleConnectStripe() {
    try {
      const res = await connectStripe().unwrap();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch {
      toast.error("Failed to connect with Stripe");
    }
  }

  const { data: rawTransactions } = useGetTransactionsQuery();
  const transactions = rawTransactions || [];

  const { data: rawWithdrawRequests, isLoading: isLoadingWithdraws } =
    useGetWithdrawRequestsQuery();
  const withdrawRequests = rawWithdrawRequests || [];

  const filteredWithdrawRequests = useMemo(() => {
    const q = withdrawSearch.trim().toLowerCase();
    if (!q) return withdrawRequests;
    return withdrawRequests.filter((r) => r._id.toLowerCase().includes(q));
  }, [withdrawRequests, withdrawSearch]);

  const tableRowClass =
    "border-b transition-colors duration-200 hover:bg-muted/40 data-[state=selected]:bg-muted [&:last-child]:border-0";

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={earningsPageLoadTransition}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Earnings &amp; Payouts</h1>
        <p className="text-muted-foreground text-sm">
          Track your earnings, available balance, and payout activity.
        </p>
      </div>

      <motion.div
        className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
        variants={earningsInfoBannerVariants}
        initial="hidden"
        animate="visible"
      >
        Service provider earnings are counted only after customer approval.
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={earningsTopStaggerParentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={earningsTopCardVariants}
          {...earningsCardLiftHover}
          className="min-h-0"
        >
          <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                <AnimatedNumber
                  value={totalEarnings}
                  format={(n) => fmtMoney(n)}
                  duration={0.85}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Approved completed bookings only
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={earningsTopCardVariants}
          {...earningsCardLiftHover}
          className="min-h-0"
        >
          <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                <AnimatedNumber
                  value={availableBalance}
                  format={(n) => fmtMoney(n)}
                  duration={0.85}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Ready to withdraw
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={earningsTopCardVariants}
          {...earningsCardLiftHover}
          className="min-h-0"
        >
          <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pending Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                <AnimatedNumber
                  value={pendingPayout}
                  format={(n) => fmtMoney(n)}
                  duration={0.85}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Completed but not yet approved
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={earningsTableSectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Input
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search Transaction ID"
                className={cn(
                  "bg-white sm:max-w-xs",
                  earningsInputFocusClass,
                  "rounded-xl border border-gray-200 shadow-sm",
                )}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">S.N</TableHead>
                  <TableHead className="w-[110px]">Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[190px]">Date &amp; Time</TableHead>
                  <TableHead className="w-[160px]">Transaction ID</TableHead>
                  <TableHead className="w-[120px] text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              {transactions.length ? (
                <motion.tbody
                  className="[&_tr:last-child]:border-0"
                  variants={earningsTableStaggerParentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {transactions.map((t, idx) => (
                    <motion.tr
                      key={t._id}
                      variants={earningsTableRowVariants}
                      className={tableRowClass}
                    >
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <Badge className={typeBadgeClass(t.type)}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDateTime(t.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {t.transactionId}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {fmtMoney(t.amount)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={earningsTableSectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Withdrawal Requests</CardTitle>
              <Input
                value={withdrawSearch}
                onChange={(e) => setWithdrawSearch(e.target.value)}
                placeholder="Search Request ID"
                className={cn(
                  "bg-white sm:max-w-xs",
                  earningsInputFocusClass,
                  "rounded-xl border border-gray-200 shadow-sm",
                )}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">S.N</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="w-[190px]">Date &amp; Time</TableHead>
                  <TableHead className="w-[160px]">Request ID</TableHead>
                  <TableHead className="w-[120px] text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              {isLoadingWithdraws ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      Loading withdrawal requests...
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : filteredWithdrawRequests.length ? (
                <motion.tbody
                  className="[&_tr:last-child]:border-0"
                  variants={earningsTableStaggerParentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredWithdrawRequests.map((r, idx) => (
                    <motion.tr
                      key={r._id}
                      variants={earningsTableRowVariants}
                      className={tableRowClass}
                    >
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <Badge className={withdrawStatusBadgeClass(r.status)}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {r.method}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDateTime(r.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r._id}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {fmtMoney(r.amount)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No withdrawal requests found.
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={earningsBottomGridParentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={earningsWithdrawSectionVariants}
          className="min-h-0"
        >
          <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Amount</div>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="Enter amount"
                  className={cn(
                    "bg-white rounded-xl border border-gray-200 shadow-sm",
                    earningsInputFocusClass,
                  )}
                />
                <div className="text-xs text-muted-foreground">
                  Minimum withdraw: $50
                </div>
              </div>

              <motion.div
                className="inline-flex"
                {...earningsButtonMotionProps}
              >
                <Button
                  type="button"
                  className="bg-[#895129] hover:bg-[#7b4723]"
                  disabled={!canWithdraw || isWithdrawing}
                  onClick={withdraw}
                >
                  {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                </Button>
              </motion.div>

              <div className="text-xs text-muted-foreground">
                Available:{" "}
                <span className="font-semibold tabular-nums">
                  <AnimatedNumber
                    value={availableBalance}
                    format={(n) => fmtMoney(n)}
                    duration={0.6}
                  />
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={earningsPaymentCardVariants} className="min-h-0">
          <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">
                  Connected method
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {connectedMethod}
                </div>
              </div>

              <motion.div
                className="inline-flex"
                {...earningsButtonMotionProps}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={isConnecting}
                  onClick={handleConnectStripe}
                >
                  {isConnecting ? "Connecting..." : "Change Method"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
