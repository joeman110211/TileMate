import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type JobStatus } from "@/lib/tiling/types";

const VARIANT: Record<JobStatus, "muted" | "default" | "sage" | "ok" | "warn"> = {
  draft: "muted",
  quoted: "default",
  accepted: "sage",
  booked: "sage",
  in_progress: "warn",
  complete: "ok",
  invoiced: "default",
  paid: "ok",
  declined: "muted",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
