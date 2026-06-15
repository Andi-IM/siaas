"use client";

import { useSearchParams } from "next/navigation";
import StudentTranscriptView from "./StudentTranscriptView";
import { Suspense } from "react";

function TranscriptPageContent() {
  const searchParams = useSearchParams();
  const nis = searchParams.get("nis") || "";
  return <StudentTranscriptView nis={nis} />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="list-page">
        <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, width: "100%" }} />
      </div>
    }>
      <TranscriptPageContent />
    </Suspense>
  );
}
