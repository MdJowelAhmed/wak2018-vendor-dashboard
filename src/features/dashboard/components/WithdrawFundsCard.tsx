import { useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CreditCard, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/utils/utils";
import {
  earningsButtonMotionProps,
  earningsInputFocusClass,
} from "@/features/dashboard/motion/earnings-page-variants";
import {
  useConnectStripeMutation,
  useCreateWithdrawRequestMutation,
} from "@/features/dashboard/services/walletApi";
import type { Wallet, WithdrawMethod } from "@/types/api";

const MIN_WITHDRAW = 50;

const PAYCHANGU_BANKS = [
  { uuid: "82310dd1-ec9b-4fe7-a32c-2f262ef08681", name: "National Bank of Malawi" },
  { uuid: "87e62436-0553-4fb5-a76d-f27d28420c5b", name: "Ecobank Malawi Limited" },
  { uuid: "b064172a-8a1b-4f7f-aad7-81b036c46c57", name: "FDH Bank Limited" },
  { uuid: "e7447c2c-c147-4907-b194-e087fe8d8585", name: "Standard Bank Limited" },
  { uuid: "236760c9-3045-4a01-990e-497b28d115bb", name: "Centenary Bank" },
  { uuid: "968ac588-3b1f-4d89-81ff-a3d43a599003", name: "First Capital Limited" },
  { uuid: "c759d7b6-ae5c-4a95-814a-79171271897a", name: "CDH Investment Bank" },
  { uuid: "86007bf5-1b04-49ba-84c1-9758bbf5c996", name: "NBS Bank Limited" },
] as const;

const PAYCHANGU_OPERATORS = [
  {
    refId: "20be6c20-adeb-4b5b-a7ba-0769820df4fb",
    name: "Airtel Money",
  },
  {
    refId: "27494cb5-ba9e-437f-a114-4e7a7686bcca",
    name: "TNM Mpamba",
  },
] as const;

import { formatCurrency as fmtMoney, convertToUsd, convertFromUsd, useCurrency } from "@/utils/format-currency";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function groupDigits(digits: string, size: number) {
  if (!digits) return "";
  return digits.replace(new RegExp(`(.{${size}})`, "g"), "$1 ").trim();
}

function sanitizeAmount(value: string) {
  const next = value.replace(/[^\d.]/g, "");
  const [whole, ...rest] = next.split(".");
  if (!rest.length) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

function NumberMaskField({
  value,
  onChange,
  maxLength,
  groupSize,
  placeholder,
  icon: Icon,
  invalid,
  hint,
}: {
  value: string;
  onChange: (digits: string) => void;
  maxLength: number;
  groupSize: number;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
  invalid?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 shadow-sm",
          "bg-gradient-to-r from-[#895129]/8 via-white to-[#f7f1ea]",
          invalid
            ? "border-red-400 ring-2 ring-red-200"
            : "border-[#895129]/25 focus-within:border-[#895129] focus-within:ring-2 focus-within:ring-[#895129]/20",
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#895129] text-white shadow-sm">
          <Icon className="size-4" />
        </div>
        <input
          value={groupDigits(value, groupSize)}
          onChange={(e) =>
            onChange(digitsOnly(e.target.value).slice(0, maxLength))
          }
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          className="h-8 w-full bg-transparent font-mono text-[15px] tracking-[0.18em] text-gray-900 outline-none placeholder:tracking-normal placeholder:text-muted-foreground"
        />
      </div>
      {hint ? (
        <p className={cn("text-xs", invalid ? "text-red-600" : "text-muted-foreground")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function withdrawMethodLabel(method?: string) {
  if (method === "stripe") return "Stripe";
  if (method === "paychangu_bank") return "Paychangu Bank";
  if (method === "paychangu_mobile_money") return "Paychangu Mobile Money";
  return method || "—";
}

export function isStripeConnected(wallet?: Wallet) {
  const stripe = wallet?.stripeConnect;
  return Boolean(stripe?.accountId && stripe.detailsSubmitted && stripe.payoutsEnabled);
}

function withdrawErrorMessage(err: unknown) {
  const data = (err as { data?: { message?: string; errorMessages?: { message?: string }[] } })
    ?.data;
  return (
    data?.errorMessages?.[0]?.message ||
    data?.message ||
    "Failed to submit withdrawal request"
  );
}

export function WithdrawFundsCard({
  wallet,
  availableBalance,
}: {
  wallet?: Wallet;
  availableBalance: number;
}) {
  const { currency } = useCurrency();
  const [createWithdrawRequest, { isLoading: isWithdrawing }] =
    useCreateWithdrawRequestMutation();
  const [connectStripe, { isLoading: isConnecting }] = useConnectStripeMutation();

  const [method, setMethod] = useState<WithdrawMethod | "">("");
  const [amount, setAmount] = useState("");
  const [bankUuid, setBankUuid] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [operatorRefId, setOperatorRefId] = useState("");

  const amountNumber = useMemo(() => Number(amount), [amount]);
  const stripeReady = isStripeConnected(wallet);
  const availableInSelected = convertFromUsd(availableBalance);
  const minInSelected = convertFromUsd(MIN_WITHDRAW);
  const usdAmount = convertToUsd(amountNumber);
  const amountValid =
    Number.isFinite(amountNumber) &&
    amountNumber >= minInSelected &&
    amountNumber > 0 &&
    amountNumber <= availableInSelected;

  const accountNumberValid =
    bankAccountNumber.length >= 10 && bankAccountNumber.length <= 19;
  const mobileValid = mobile.length >= 9 && mobile.length <= 12;

  const payoutDetailsReady =
    method === "paychangu_bank"
      ? Boolean(bankUuid.trim() && bankAccountName.trim() && accountNumberValid)
      : method === "paychangu_mobile_money"
        ? Boolean(operatorRefId.trim() && mobileValid)
        : true;

  const canWithdraw =
    Boolean(method) &&
    amountValid &&
    payoutDetailsReady &&
    (method !== "stripe" || stripeReady);

  async function handleConnectStripe() {
    try {
      const res = await connectStripe().unwrap();
      if (res.url) window.location.href = res.url;
    } catch {
      toast.error("Failed to connect with Stripe");
    }
  }

  async function withdraw() {
    if (!method) {
      toast.error("Select a withdraw method first");
      return;
    }
    if (!amount.trim()) {
      toast.error("Enter an amount");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amountNumber < minInSelected) {
      toast.error(`Minimum withdraw: ${fmtMoney(MIN_WITHDRAW)}`);
      return;
    }
    if (amountNumber > availableInSelected) {
      toast.error("Cannot exceed available balance");
      return;
    }
    if (method === "stripe" && !stripeReady) {
      toast.error("Please first connect your Stripe account, then withdraw.");
      return;
    }
    if (method === "paychangu_bank") {
      if (!bankUuid.trim() || !bankAccountName.trim()) {
        toast.error("Enter bank account details");
        return;
      }
      if (!accountNumberValid) {
        toast.error("Account number must be 10–19 digits");
        return;
      }
    }
    if (method === "paychangu_mobile_money") {
      if (!operatorRefId.trim()) {
        toast.error("Select a mobile money operator");
        return;
      }
      if (!mobileValid) {
        toast.error("Phone number must be 9–12 digits");
        return;
      }
    }

    try {
      if (method === "stripe") {
        await createWithdrawRequest({
          amount: usdAmount,
          method: "stripe",
        }).unwrap();
      } else if (method === "paychangu_bank") {
        await createWithdrawRequest({
          amount: usdAmount,
          method: "paychangu_bank",
          payoutDetails: {
            bankUuid: bankUuid.trim(),
            bankAccountName: bankAccountName.trim(),
            bankAccountNumber: bankAccountNumber.trim(),
          },
        }).unwrap();
      } else {
        await createWithdrawRequest({
          amount: usdAmount,
          method: "paychangu_mobile_money",
          payoutDetails: {
            mobile: mobile.trim(),
            mobileMoneyOperatorRefId: operatorRefId.trim(),
          },
        }).unwrap();
      }
      toast.success("Withdrawal request submitted");
      setAmount("");
    } catch (err) {
      toast.error(withdrawErrorMessage(err));
    }
  }

  return (
    <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Withdraw Funds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Amount ({currency})
          </Label>
          <Input
            value={amount}
            onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
            inputMode="decimal"
            placeholder="Enter amount"
            className={cn(
              "bg-white rounded-xl border border-gray-200 shadow-sm",
              earningsInputFocusClass,
            )}
          />
          <div className="text-xs text-muted-foreground">
            Minimum withdraw: {fmtMoney(MIN_WITHDRAW)} · Available{" "}
            <span className="font-semibold tabular-nums">
              <AnimatedNumber
                value={availableBalance}
                format={(n) => fmtMoney(n)}
                duration={0.6}
              />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Withdraw method
          </Label>
          <Select
            value={method || undefined}
            onValueChange={(value) => setMethod(value as WithdrawMethod)}
          >
            <SelectTrigger
              className={cn(
                "w-full bg-white rounded-xl border border-gray-200 shadow-sm",
                earningsInputFocusClass,
              )}
            >
              <SelectValue placeholder="Select a method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paychangu_bank">Paychangu Bank</SelectItem>
              <SelectItem value="paychangu_mobile_money">
                Paychangu Mobile Money
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {method === "stripe" ? (
          <div className="rounded-xl border border-gray-200 bg-muted/20 p-3 text-sm">
            {stripeReady ? (
              <p className="text-emerald-700">
                Stripe account is connected. You can withdraw.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-amber-700">
                  Please first connect your Stripe account, then withdraw.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isConnecting}
                  onClick={handleConnectStripe}
                >
                  {isConnecting ? "Connecting..." : "Connect Stripe account"}
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {method === "paychangu_bank" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Bank</Label>
              <Select value={bankUuid || undefined} onValueChange={setBankUuid}>
                <SelectTrigger
                  className={cn(
                    "w-full bg-white rounded-xl border border-gray-200 shadow-sm",
                    earningsInputFocusClass,
                  )}
                >
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {PAYCHANGU_BANKS.map((bank) => (
                    <SelectItem key={bank.uuid} value={bank.uuid}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Account name
              </Label>
              <Input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="John Doe"
                className={cn(
                  "bg-white rounded-xl border border-gray-200 shadow-sm",
                  earningsInputFocusClass,
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Account number
              </Label>
              <NumberMaskField
                value={bankAccountNumber}
                onChange={setBankAccountNumber}
                maxLength={19}
                groupSize={4}
                placeholder="0000 0000 0000 0000"
                icon={CreditCard}
                invalid={Boolean(bankAccountNumber) && !accountNumberValid}
                hint={
                  bankAccountNumber && !accountNumberValid
                    ? "Enter 10–19 digits only"
                    : "Numbers only · shown like a card number"
                }
              />
            </div>
          </div>
        ) : null}

        {method === "paychangu_mobile_money" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Operator
              </Label>
              <Select
                value={operatorRefId || undefined}
                onValueChange={setOperatorRefId}
              >
                <SelectTrigger
                  className={cn(
                    "w-full bg-white rounded-xl border border-gray-200 shadow-sm",
                    earningsInputFocusClass,
                  )}
                >
                  <SelectValue placeholder="Select an operator" />
                </SelectTrigger>
                <SelectContent>
                  {PAYCHANGU_OPERATORS.map((op) => (
                    <SelectItem key={op.refId} value={op.refId}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Phone number
              </Label>
              <NumberMaskField
                value={mobile}
                onChange={setMobile}
                maxLength={12}
                groupSize={3}
                placeholder="990 000 000"
                icon={Smartphone}
                invalid={Boolean(mobile) && !mobileValid}
                hint={
                  mobile && !mobileValid
                    ? "Enter 9–12 digits only"
                    : "Numbers only"
                }
              />
            </div>
          </div>
        ) : null}

        <motion.div className="inline-flex" {...earningsButtonMotionProps}>
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            disabled={!canWithdraw || isWithdrawing}
            onClick={withdraw}
          >
            {isWithdrawing ? "Processing..." : "Withdraw Funds"}
          </Button>
        </motion.div>

        {method === "stripe" && !stripeReady ? (
          <p className="text-xs text-amber-700">
            Please first connect your Stripe account, then withdraw.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
