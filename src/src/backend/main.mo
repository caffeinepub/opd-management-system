import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import InternetComputer "mo:core/InternetComputer";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type Gender = { #male; #female; #other };
  public type Vitals = {
    bloodPressure : ?Text;
    temperature : ?Float;
    pulse : ?Nat;
    weight : ?Float;
  };

  public type Patient = {
    id : Nat;
    name : Text;
    age : Nat;
    gender : Gender;
    contactNumber : Text;
    address : Text;
    medicalHistory : [Text];
  };

  public type ClinicalVisit = {
    id : Nat;
    patientId : Nat;
    date : Int;
    symptoms : [Text];
    diagnosis : Text;
    treatmentPlan : [Text];
    vitals : Vitals;
  };

  public type FollowUp = {
    id : Nat;
    patientId : Nat;
    appointmentDate : Int;
    notes : Text;
    completed : Bool;
  };

  public type Prescription = {
    id : Nat;
    patientId : Nat;
    visitId : Nat;
    medicines : [Medicine];
    doctorName : Text;
    date : Int;
  };

  public type Medicine = {
    name : Text;
    dosage : Text;
    frequency : Text;
    duration : Text;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  module Patient {
    public func compare(p1 : Patient, p2 : Patient) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  // State
  let patients = Map.empty<Nat, Patient>();
  let clinicalVisits = Map.empty<Nat, ClinicalVisit>();
  let followUps = Map.empty<Nat, FollowUp>();
  let prescriptions = Map.empty<Nat, Prescription>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var patientIdCounter = 0;
  var visitIdCounter = 0;
  var followUpIdCounter = 0;
  var prescriptionIdCounter = 0;

  // User Profile Functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Patient Management Functions

  public shared ({ caller }) func registerPatient(
    name : Text,
    age : Nat,
    gender : Gender,
    contactNumber : Text,
    address : Text,
    medicalHistory : [Text],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can register patients");
    };

    patientIdCounter += 1;
    let patient : Patient = {
      id = patientIdCounter;
      name;
      age;
      gender;
      contactNumber;
      address;
      medicalHistory;
    };
    patients.add(patient.id, patient);
    patient.id;
  };

  public query ({ caller }) func searchPatientsByName(name : Text) : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can search patients");
    };

    patients.values().toArray().filter(
      func(p) {
        p.name.toLower().contains(#text(name.toLower()));
      }
    );
  };

  public query ({ caller }) func searchPatientsByContact(contact : Text) : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can search patients");
    };

    patients.values().toArray().filter(
      func(p) {
        p.contactNumber.contains(#text(contact));
      }
    );
  };

  public query ({ caller }) func getPatientById(id : Nat) : async ?Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view patient details");
    };

    patients.get(id);
  };

  public shared ({ caller }) func updatePatient(id : Nat, name : Text, age : Nat, gender : Gender, contactNumber : Text, address : Text, medicalHistory : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update patients");
    };

    switch (patients.get(id)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?_) {
        let updatedPatient : Patient = {
          id;
          name;
          age;
          gender;
          contactNumber;
          address;
          medicalHistory;
        };
        patients.add(id, updatedPatient);
      };
    };
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can list all patients");
    };

    patients.values().toArray().sort();
  };

  // Clinical Records Functions

  public shared ({ caller }) func createClinicalVisit(patientId : Nat, date : Int, symptoms : [Text], diagnosis : Text, treatmentPlan : [Text], vitals : Vitals) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create clinical visits");
    };

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?_) {
        visitIdCounter += 1;
        let visit : ClinicalVisit = {
          id = visitIdCounter;
          patientId;
          date;
          symptoms;
          diagnosis;
          treatmentPlan;
          vitals;
        };
        clinicalVisits.add(visit.id, visit);
        visit.id;
      };
    };
  };

  public query ({ caller }) func getClinicalHistory(patientId : Nat) : async [ClinicalVisit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view clinical history");
    };

    clinicalVisits.values().toArray().filter(
      func(v) { v.patientId == patientId }
    );
  };

  public query ({ caller }) func getVisitById(id : Nat) : async ?ClinicalVisit {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view visit details");
    };

    clinicalVisits.get(id);
  };

  public shared ({ caller }) func updateVisit(id : Nat, symptoms : [Text], diagnosis : Text, treatmentPlan : [Text], vitals : Vitals) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update visits");
    };

    switch (clinicalVisits.get(id)) {
      case (null) { Runtime.trap("Visit not found") };
      case (?visit) {
        let updatedVisit : ClinicalVisit = {
          id = visit.id;
          patientId = visit.patientId;
          date = visit.date;
          symptoms;
          diagnosis;
          treatmentPlan;
          vitals;
        };
        clinicalVisits.add(id, updatedVisit);
      };
    };
  };

  // Follow-up Functions

  public shared ({ caller }) func scheduleFollowUp(patientId : Nat, appointmentDate : Int, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can schedule follow-ups");
    };

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?_) {
        followUpIdCounter += 1;
        let followUp : FollowUp = {
          id = followUpIdCounter;
          patientId;
          appointmentDate;
          notes;
          completed = false;
        };
        followUps.add(followUp.id, followUp);
        followUp.id;
      };
    };
  };

  public query ({ caller }) func getUpcomingFollowUps(patientId : Nat) : async [FollowUp] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view follow-ups");
    };

    followUps.values().toArray().filter(
      func(f) { f.patientId == patientId and not f.completed }
    );
  };

  public query ({ caller }) func getAllFollowUps() : async [FollowUp] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can list all follow-ups");
    };

    followUps.values().toArray();
  };

  public shared ({ caller }) func markFollowUpCompleted(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can mark follow-ups as completed");
    };

    switch (followUps.get(id)) {
      case (null) { Runtime.trap("Follow-up not found") };
      case (?followUp) {
        let updatedFollowUp : FollowUp = {
          id = followUp.id;
          patientId = followUp.patientId;
          appointmentDate = followUp.appointmentDate;
          notes = followUp.notes;
          completed = true;
        };
        followUps.add(id, updatedFollowUp);
      };
    };
  };

  public shared ({ caller }) func cancelFollowUp(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can cancel follow-ups");
    };

    switch (followUps.get(id)) {
      case (null) { Runtime.trap("Follow-up not found") };
      case (?_) {
        followUps.remove(id);
      };
    };
  };

  // Prescription Functions

  public shared ({ caller }) func createPrescription(patientId : Nat, visitId : Nat, medicines : [Medicine], doctorName : Text, date : Int) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create prescriptions");
    };

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?_) {
        switch (clinicalVisits.get(visitId)) {
          case (null) { Runtime.trap("Clinical visit not found") };
          case (?_) {
            prescriptionIdCounter += 1;
            let prescription : Prescription = {
              id = prescriptionIdCounter;
              patientId;
              visitId;
              medicines;
              doctorName;
              date;
            };
            prescriptions.add(prescription.id, prescription);
            prescription.id;
          };
        };
      };
    };
  };

  public query ({ caller }) func getPrescriptionsByPatient(patientId : Nat) : async [Prescription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view prescriptions");
    };

    prescriptions.values().toArray().filter(
      func(p) { p.patientId == patientId }
    );
  };

  public query ({ caller }) func getPrescriptionById(id : Nat) : async ?Prescription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view prescription details");
    };

    prescriptions.get(id);
  };

  public shared ({ caller }) func updatePrescription(id : Nat, medicines : [Medicine], doctorName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update prescriptions");
    };

    switch (prescriptions.get(id)) {
      case (null) { Runtime.trap("Prescription not found") };
      case (?prescription) {
        let updatedPrescription : Prescription = {
          id = prescription.id;
          patientId = prescription.patientId;
          visitId = prescription.visitId;
          medicines;
          doctorName;
          date = prescription.date;
        };
        prescriptions.add(id, updatedPrescription);
      };
    };
  };
};
