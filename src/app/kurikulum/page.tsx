"use client";

import { Suspense } from "react";
import KurikulumView from "./KurikulumView";
import { KurikulumFallback } from "./fallback";

export default function KurikulumPage() {
  return (
    <Suspense fallback={<KurikulumFallback />}>
      <KurikulumView />
    </Suspense>
  );
}
