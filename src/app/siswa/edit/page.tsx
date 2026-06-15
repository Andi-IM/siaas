"use client";

import { useSearchParams } from "next/navigation";
import EditSiswaView from "@/app/siswa/edit/EditSiswaView";
import { Suspense } from "react";

function EditFallback() {
  return (
    <div className="form-page">
      <div className="form-page__inner">
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 16, width: "100%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "100%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "60%" }} />
      </div>
    </div>
  );
}

function EditPageContent() {
  const searchParams = useSearchParams();
  const nis = searchParams.get("nis") || "";
  return <EditSiswaView nis={nis} />;
}

export default function EditPage() {
  return (
    <Suspense fallback={<EditFallback />}>
      <EditPageContent />
    </Suspense>
  );
}
