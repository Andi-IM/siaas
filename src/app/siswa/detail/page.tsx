"use client";

import { Suspense } from "react";
import { DetailFallback, DetailPageContent } from "@/app/siswa/detail/StudentDetailView";

export default function DetailPage() {
  return (
    <Suspense fallback={<DetailFallback />}>
      <DetailPageContent />
    </Suspense>
  );
}
