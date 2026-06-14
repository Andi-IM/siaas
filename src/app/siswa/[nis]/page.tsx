import { getStudents } from "@/lib/data";
import StudentDetailView from "./StudentDetailView";

export function generateStaticParams() {
  const students = getStudents();
  return students.map((student) => ({
    nis: student.nis,
  }));
}

export default async function Page({ params }: { params: Promise<{ nis: string }> }) {
  const { nis } = await params;
  return <StudentDetailView nis={nis} />;
}
