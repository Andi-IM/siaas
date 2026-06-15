"use client";

import { Suspense } from "react";
import { EditFallback, EditPageContent } from "@/app/siswa/edit/EditSiswaView";

export default function EditPage() {
  return (
    <Suspense fallback={<EditFallback />}>
      <EditPageContent />
    </Suspense>
  );
}
