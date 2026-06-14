import { getStudents } from "@/lib/data";
import StudentTranscriptView from "./StudentTranscriptView";

export function generateStaticParams() {
  const students = getStudents();
  return students.map((student) => ({
    nis: student.nis,
  }));
}

export default async function Page({ params }: { params: Promise<{ nis: string }> }) {
  const { nis } = await params;
  return <StudentTranscriptView nis={nis} />;
}
