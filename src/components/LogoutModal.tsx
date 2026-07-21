import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/motion";

export function LogoutModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent
        className="rounded-2xl border border-gray-100 bg-white/90 shadow-xl backdrop-blur"
        showClose={false}
      >
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={onConfirm}
            >
              Logout
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
