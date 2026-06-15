"use client";

import { useSearchParams } from "next/navigation";
import StudentDetailView from "@/app/siswa/detail/StudentDetailView";
import { Suspense } from "react";

function DetailFallback() {
  return (
    <div className="form-page">
      <div className="form-page__inner">
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "50%" }} />
      </div>
    </div>
  );
}

function DetailPageContent() {
  const searchParams = useSearchParams();
  const nis = searchParams.get("nis") || "";
  return <StudentDetailView nis={nis} />;
}

export default function DetailPage() {
  return (
    <Suspense fallback={<DetailFallback />}>
      <DetailPageContent />
    </Suspense>
  );
}
