import { Suspense } from "react";
import PengaturanView from "@/app/pengaturan/PengaturanView";
import { PengaturanFallback } from "./fallback";

export default function PengaturanPage() {
  return (
    <Suspense fallback={<PengaturanFallback />}>
      <PengaturanView />
    </Suspense>
  );
}
