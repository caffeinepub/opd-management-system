# OPD Management System

## Current State

This is a new Caffeine project with a basic React + TypeScript frontend setup. The project includes:
- Internet Identity authentication via `useInternetIdentity` hook
- React Query for data fetching
- shadcn/ui component library
- No backend APIs yet
- No App.tsx or main application logic

## Requested Changes (Diff)

### Add

**Backend:**
- Patient registration system with fields: name, age, gender, contact number, address, medical history
- Clinical details management: symptoms, diagnosis, treatment plan, vitals (BP, temperature, pulse, weight)
- Follow-up appointment scheduling and tracking
- Prescription generation with medication details (name, dosage, frequency, duration)
- Data persistence for all patient records

**Frontend:**
- Patient registration form
- Patient search and list view
- Clinical details entry form for each patient visit
- Follow-up appointment calendar/scheduler
- Prescription editor with print functionality
- Patient dashboard showing registration info, clinical history, and follow-ups

### Modify

- Add App.tsx with routing for different OPD modules
- Integrate authentication to secure patient data

### Remove

None

## Implementation Plan

1. **Select Caffeine Components:**
   - Authorization component for role-based access (doctor, receptionist roles)

2. **Backend Generation:**
   - Patient management APIs: create patient, search patients, get patient details, update patient info
   - Clinical records APIs: add clinical visit, get patient history, update visit details
   - Follow-up APIs: schedule follow-up, get upcoming follow-ups, mark follow-up completed
   - Prescription APIs: create prescription, get prescriptions for patient

3. **Frontend Implementation:**
   - Create App.tsx with navigation between modules
   - Patient Registration page with form
   - Patient List/Search page
   - Clinical Details page with vitals and diagnosis entry
   - Follow-up Management page with calendar view
   - Prescription page with print-friendly layout
   - Integrate backend APIs using React Query
   - Add print CSS for prescription printing

## UX Notes

- Emphasize quick data entry with autosave where appropriate
- Provide search/filter for finding existing patients
- Make prescription printing browser-friendly (window.print())
- Use tabs or sidebar navigation for different OPD modules
- Show patient summary at top when viewing clinical details or prescriptions
- Use date pickers for appointment scheduling
- Display validation errors clearly on forms
