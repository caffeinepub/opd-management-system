import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Patient, ClinicalVisit, FollowUp, Prescription, Gender, Medicine, Vitals } from "../backend.d";

// ============ PATIENTS ============

export function useGetAllPatients() {
  const { actor, isFetching } = useActor();
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPatientById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Patient | null>({
    queryKey: ["patient", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getPatientById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSearchPatientsByName(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Patient[]>({
    queryKey: ["patients", "search", "name", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchPatientsByName(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useSearchPatientsByContact(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Patient[]>({
    queryKey: ["patients", "search", "contact", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchPatientsByContact(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useRegisterPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      age: bigint;
      gender: Gender;
      contactNumber: string;
      address: string;
      medicalHistory: string[];
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.registerPatient(
        data.name,
        data.age,
        data.gender,
        data.contactNumber,
        data.address,
        data.medicalHistory
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      age: bigint;
      gender: Gender;
      contactNumber: string;
      address: string;
      medicalHistory: string[];
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updatePatient(
        data.id,
        data.name,
        data.age,
        data.gender,
        data.contactNumber,
        data.address,
        data.medicalHistory
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id.toString()] });
    },
  });
}

// ============ CLINICAL VISITS ============

export function useGetClinicalHistory(patientId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ClinicalVisit[]>({
    queryKey: ["clinicalHistory", patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return [];
      return actor.getClinicalHistory(patientId);
    },
    enabled: !!actor && !isFetching && patientId !== null,
  });
}

export function useGetVisitById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ClinicalVisit | null>({
    queryKey: ["visit", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getVisitById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateClinicalVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: bigint;
      date: bigint;
      symptoms: string[];
      diagnosis: string;
      treatmentPlan: string[];
      vitals: Vitals;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createClinicalVisit(
        data.patientId,
        data.date,
        data.symptoms,
        data.diagnosis,
        data.treatmentPlan,
        data.vitals
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clinicalHistory", variables.patientId.toString()] });
    },
  });
}

export function useUpdateVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      patientId: bigint;
      symptoms: string[];
      diagnosis: string;
      treatmentPlan: string[];
      vitals: Vitals;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateVisit(
        data.id,
        data.symptoms,
        data.diagnosis,
        data.treatmentPlan,
        data.vitals
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clinicalHistory", variables.patientId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["visit", variables.id.toString()] });
    },
  });
}

// ============ FOLLOW-UPS ============

export function useGetAllFollowUps() {
  const { actor, isFetching } = useActor();
  return useQuery<FollowUp[]>({
    queryKey: ["followUps"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFollowUps();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUpcomingFollowUps(patientId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FollowUp[]>({
    queryKey: ["followUps", "upcoming", patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return [];
      return actor.getUpcomingFollowUps(patientId);
    },
    enabled: !!actor && !isFetching && patientId !== null,
  });
}

export function useScheduleFollowUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: bigint;
      appointmentDate: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.scheduleFollowUp(
        data.patientId,
        data.appointmentDate,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followUps"] });
    },
  });
}

export function useMarkFollowUpCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.markFollowUpCompleted(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followUps"] });
    },
  });
}

export function useCancelFollowUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.cancelFollowUp(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followUps"] });
    },
  });
}

// ============ PRESCRIPTIONS ============

export function useGetPrescriptionsByPatient(patientId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Prescription[]>({
    queryKey: ["prescriptions", "patient", patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return [];
      return actor.getPrescriptionsByPatient(patientId);
    },
    enabled: !!actor && !isFetching && patientId !== null,
  });
}

export function useGetPrescriptionById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Prescription | null>({
    queryKey: ["prescription", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getPrescriptionById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreatePrescription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: bigint;
      visitId: bigint;
      medicines: Medicine[];
      doctorName: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createPrescription(
        data.patientId,
        data.visitId,
        data.medicines,
        data.doctorName,
        data.date
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions", "patient", variables.patientId.toString()] });
    },
  });
}

export function useUpdatePrescription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      patientId: bigint;
      medicines: Medicine[];
      doctorName: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updatePrescription(
        data.id,
        data.medicines,
        data.doctorName
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions", "patient", variables.patientId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["prescription", variables.id.toString()] });
    },
  });
}
