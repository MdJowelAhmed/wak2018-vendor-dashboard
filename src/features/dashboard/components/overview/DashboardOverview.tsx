import { useSelector } from "react-redux";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/app/store";
import { useGetProfileQuery } from '@/services/userApi';
import { useDashboardViewModel } from "@/features/dashboard/hooks/useDashboardViewModel";
import { VendorDashboard } from "./VendorDashboard";
import { ServiceDashboard } from "./ServiceDashboard";
import type { UserRole } from '@/features/auth/types/authTypes';
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/components/ui/motion";

export function DashboardOverview() {
  const authRole: UserRole | undefined = useSelector(
    (s: RootState) => s.auth.user?.role,
  );
  const { data: profile } = useGetProfileQuery();
  const role: UserRole | null = authRole ?? profile?.role ?? null;

  const { data, meta, isLoading, isError, isDemo, refetch } =
    useDashboardViewModel(role);

  if ((isLoading && !data) || !role) {
    return (
      <motion.div
        className="w-full space-y-6"
        variants={staggerContainer(0.08, 0.02)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <PageHeading role={role} />
        </motion.div>
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-40 rounded-2xl border border-gray-100 bg-white/60" />
          <div className="h-40 rounded-2xl border border-gray-100 bg-white/60" />
        </div>
      </motion.div>
    );
  }

  if (isError && !data) {
    return (
      <motion.div
        className="w-full space-y-6"
        variants={staggerContainer(0.08, 0.02)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <PageHeading role={role} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Alert variant="destructive">
            <AlertTitle>Could not load dashboard</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-2">
              Data source is static demo right now. Try again.
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      </motion.div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="w-full space-y-6"
      variants={staggerContainer(0.08, 0.02)}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <PageHeading role={role} />
      </motion.div>

      {isDemo && (
        <motion.div variants={fadeUp}>
          <Alert>
            <AlertTitle>Demo data</AlertTitle>
            <AlertDescription>Showing static sample data.</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        {role === "vendor" && <VendorDashboard data={data} />}
        {role === "service" && <ServiceDashboard data={data} meta={meta} />}
      </motion.div>
    </motion.div>
  );
}

function PageHeading({ role }: { role: UserRole | null }) {
  return (
    <div className="space-y-1">
      <h1 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
        Dashboard overview
      </h1>
      <p className="text-sm text-gray-500">
        {role === "service"
          ? "Service performance: jobs and earnings in one place."
          : "Business performance: products and deliveries in one place."}
      </p>
    </div>
  );
}
