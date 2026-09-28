import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export default function ActorNotFound() {
  return (
    <div>
      <PageHeader
        title="Actor not found"
        description="This identifier is not present in the synthetic actor catalog."
      />
      <Link href="/actors" className="text-sm font-medium text-blue-600 hover:underline">
        Return to actor directory
      </Link>
    </div>
  );
}
