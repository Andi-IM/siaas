"use client";

import { Suspense } from "react";
import TambahSiswaView from "@/app/siswa/tambah/TambahSiswaView";
import { TambahFallback } from "./fallback";

export default function TambahSiswaPage() {
  return (
    <Suspense fallback={<TambahFallback />}>
      <TambahSiswaView />
    </Suspense>
  );
}
