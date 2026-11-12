import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { earningsButtonMotionProps } from "@/features/dashboard/motion/earnings-page-variants";
import { useConnectStripeMutation } from "@/features/dashboard/services/walletApi";
import type { Wallet } from "@/types/api";
import { isStripeConnected } from "./WithdrawFundsCard";

export function PaymentMethodCard({ wallet }: { wallet?: Wallet }) {
  const [connectStripe, { isLoading: isConnecting }] = useConnectStripeMutation();
  const stripeReady = isStripeConnected(wallet);

  async function handleConnectStripe() {
    try {
      const res = await connectStripe().unwrap();
      if (res.url) window.location.href = res.url;
    } catch {
      toast.error("Failed to connect with Stripe");
    }
  }

  return (
    <Card className="h-full rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Stripe Connect</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">
            {stripeReady ? "Stripe (Payouts Enabled)" : "Stripe (Action Required)"}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Connect Stripe before choosing it as a withdraw method. Paychangu
            Bank and Mobile Money do not require Stripe.
          </p>
        </div>

        <motion.div className="inline-flex" {...earningsButtonMotionProps}>
          <Button
            type="button"
            variant="outline"
            disabled={isConnecting}
            onClick={handleConnectStripe}
          >
            {isConnecting
              ? "Connecting..."
              : stripeReady
                ? "Update Stripe account"
                : "Connect Stripe account"}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
