import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Vitals {
    weight?: number;
    temperature?: number;
    bloodPressure?: string;
    pulse?: bigint;
}
export interface ClinicalVisit {
    id: bigint;
    patientId: bigint;
    date: bigint;
    diagnosis: string;
    symptoms: Array<string>;
    treatmentPlan: Array<string>;
    vitals: Vitals;
}
export interface Medicine {
    duration: string;
    dosage: string;
    name: string;
    frequency: string;
}
export interface FollowUp {
    id: bigint;
    patientId: bigint;
    completed: boolean;
    appointmentDate: bigint;
    notes: string;
}
export interface Prescription {
    id: bigint;
    patientId: bigint;
    date: bigint;
    visitId: bigint;
    doctorName: string;
    medicines: Array<Medicine>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Patient {
    id: bigint;
    age: bigint;
    name: string;
    medicalHistory: Array<string>;
    address: string;
    gender: Gender;
    contactNumber: string;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelFollowUp(id: bigint): Promise<void>;
    createClinicalVisit(patientId: bigint, date: bigint, symptoms: Array<string>, diagnosis: string, treatmentPlan: Array<string>, vitals: Vitals): Promise<bigint>;
    createPrescription(patientId: bigint, visitId: bigint, medicines: Array<Medicine>, doctorName: string, date: bigint): Promise<bigint>;
    getAllFollowUps(): Promise<Array<FollowUp>>;
    getAllPatients(): Promise<Array<Patient>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClinicalHistory(patientId: bigint): Promise<Array<ClinicalVisit>>;
    getPatientById(id: bigint): Promise<Patient | null>;
    getPrescriptionById(id: bigint): Promise<Prescription | null>;
    getPrescriptionsByPatient(patientId: bigint): Promise<Array<Prescription>>;
    getUpcomingFollowUps(patientId: bigint): Promise<Array<FollowUp>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitById(id: bigint): Promise<ClinicalVisit | null>;
    isCallerAdmin(): Promise<boolean>;
    markFollowUpCompleted(id: bigint): Promise<void>;
    registerPatient(name: string, age: bigint, gender: Gender, contactNumber: string, address: string, medicalHistory: Array<string>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scheduleFollowUp(patientId: bigint, appointmentDate: bigint, notes: string): Promise<bigint>;
    searchPatientsByContact(contact: string): Promise<Array<Patient>>;
    searchPatientsByName(name: string): Promise<Array<Patient>>;
    updatePatient(id: bigint, name: string, age: bigint, gender: Gender, contactNumber: string, address: string, medicalHistory: Array<string>): Promise<void>;
    updatePrescription(id: bigint, medicines: Array<Medicine>, doctorName: string): Promise<void>;
    updateVisit(id: bigint, symptoms: Array<string>, diagnosis: string, treatmentPlan: Array<string>, vitals: Vitals): Promise<void>;
}
