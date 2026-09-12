import type { CategoryKey, CityKey, SpecialtyKey } from "@projectx/types";
import { currentDoctor } from "./doctors";
import { currentDoctorUser } from "./users";

/** Pre-filled values for the doctor onboarding wizard (mock: mirrors the demo doctor). */
export const onboardingDraft: {
  firstName: string;
  lastName: string;
  birthDate: string;
  specialty: SpecialtyKey;
  category: CategoryKey;
  experienceYears: number;
  clinicName: string;
  city: CityKey;
  address: string;
  phone: string;
  price: number;
  slotDurationMin: number;
} = {
  firstName: currentDoctorUser.firstName,
  lastName: currentDoctorUser.lastName,
  birthDate: "1985-04-12",
  specialty: currentDoctor.specialty,
  category: currentDoctor.category,
  experienceYears: currentDoctor.experienceYears,
  clinicName: currentDoctor.clinicName,
  city: currentDoctor.city,
  address: currentDoctor.address,
  phone: currentDoctor.phone,
  price: currentDoctor.price ?? 0,
  slotDurationMin: currentDoctor.slotDurationMin,
};
