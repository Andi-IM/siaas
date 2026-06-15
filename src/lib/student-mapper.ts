import type { Student } from "./types";

export interface DbStudent {
  id: string;
  major_id: string;
  full_name: string;
  nis: string;
  nisn: string;
  place_of_birth: string | null;
  date_of_birth: string | null;
  gender: string | null;
  religion: string | null;
  family_status: string | null;
  child_order: number | null;
  home_address: string | null;
  telephone: string | null;
  previous_school: string | null;
  admission_grade: string | null;
  admission_date: string | null;
  father_name: string | null;
  mother_name: string | null;
  parent_address: string | null;
  father_occupation: string | null;
  mother_occupation: string | null;
  guardian_name: string | null;
  guardian_address: string | null;
  guardian_phone_number: string | null;
  guardian_occupation: string | null;
  diploma_number: string | null;
  graduation_date: string | null;
  created_at: string;
  updated_at: string;
}

export function mapDbToFrontend(db: DbStudent, majorsMap: Map<string, string>): Student {
  return {
    nis: db.nis,
    nisn: db.nisn,
    nama: db.full_name,
    tempatLahir: db.place_of_birth ?? "",
    tanggalLahir: db.date_of_birth ?? "",
    jenisKelamin: (db.gender as "L" | "P") ?? "L",
    agama: db.religion ?? "",
    alamat: db.home_address ?? "",
    telepon: db.telephone ?? "",
    sekolahAsal: db.previous_school ?? "",
    diterimaDiKelas: db.admission_grade ?? "",
    diterimaPadaTanggal: db.admission_date ?? "",
    kompetensi: majorsMap.get(db.major_id) ?? db.major_id,
    nomorIjazah: db.diploma_number ?? "",
    tanggalKelulusan: db.graduation_date ?? "",
    status: "active",
    namaAyah: db.father_name ?? "",
    pekerjaanAyah: db.father_occupation ?? "",
    namaIbu: db.mother_name ?? "",
    pekerjaanIbu: db.mother_occupation ?? "",
    alamatOrangTua: db.parent_address ?? "",
    namaWali: db.guardian_name ?? "",
    alamatWali: db.guardian_address ?? "",
    teleponWali: db.guardian_phone_number ?? "",
    pekerjaanWali: db.guardian_occupation ?? "",
  };
}
