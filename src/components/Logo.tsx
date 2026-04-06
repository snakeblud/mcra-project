import Link from "next/link";
import { Target } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md">
        <Target className="h-4 w-4 text-white" />
      </div>
      <span className="text-foreground text-lg font-bold tracking-tight">
        BidBuddy
      </span>
    </Link>
  );
}
