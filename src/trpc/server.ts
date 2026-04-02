import type { ReactNode } from "react";

// Frontend-only: HydrateClient is a no-op passthrough
export function HydrateClient(props: { children: ReactNode }) {
  return props.children as React.ReactElement;
}
