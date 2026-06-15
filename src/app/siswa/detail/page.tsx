"use client";

import { useSearchParams } from "next/navigation";
import StudentDetailView from "./StudentDetailView";
import { Suspense } from "react";

function DetailPageContent() {
  const searchParams = useSearchParams();
  const nis = searchParams.get("nis") || "";
  return <StudentDetailView nis={nis} />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="form-page">
        <div className="form-page__inner">
          <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "50%" }} />
        </div>
      </div>
    }>
      <DetailPageContent />
    </Suspense>
  );
}
