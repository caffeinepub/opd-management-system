import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  useGetAllPatients,
  useGetClinicalHistory,
  useGetPrescriptionsByPatient,
  useCreatePrescription,
} from "../hooks/useQueries";
import { Pill, Loader2, Plus, Printer, Trash2, User, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Medicine, Prescription } from "../backend.d";

export default function Prescriptions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<bigint | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<bigint | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);

  const { data: patients = [] } = useGetAllPatients();
  const { data: clinicalHistory = [] } = useGetClinicalHistory(selectedPatientId);
  const { data: prescriptions = [] } = useGetPrescriptionsByPatient(selectedPatientId);
  const createPrescription = useCreatePrescription();

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedVisitId) return;

    // Validate medicines
    const validMedicines = medicines.filter(
      (m) => m.name.trim() && m.dosage.trim() && m.frequency.trim() && m.duration.trim()
    );

    if (validMedicines.length === 0) {
      toast.error("Please add at least one complete medicine entry");
      return;
    }

    if (!doctorName.trim()) {
      toast.error("Please enter doctor name");
      return;
    }

    try {
      await createPrescription.mutateAsync({
        patientId: selectedPatientId,
        visitId: selectedVisitId,
        medicines: validMedicines,
        doctorName: doctorName.trim(),
        date: BigInt(Date.now() * 1_000_000),
      });

      toast.success("Prescription created successfully");
      setShowAddDialog(false);
      setSelectedVisitId(null);
      setDoctorName("");
      setMedicines([{ name: "", dosage: "", frequency: "", duration: "" }]);
    } catch (error) {
      toast.error("Failed to create prescription");
      console.error(error);
    }
  };

  const handlePrint = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrintDialog(true);
    // Delay print to allow dialog to render
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const formatDate = (nanoTimestamp: bigint) => {
    const ms = Number(nanoTimestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPatientDetails = (patientId: bigint) => {
    return patients.find((p) => p.id === patientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">Prescriptions</CardTitle>
                <CardDescription>Create and manage patient prescriptions</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Prescription
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Select Patient:</Label>
            <Select
              value={selectedPatientId?.toString() || ""}
              onValueChange={(value) => setSelectedPatientId(value ? BigInt(value) : null)}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Choose a patient..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      {selectedPatientId && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Prescription History</CardTitle>
            <CardDescription>
              {selectedPatient?.name} - {prescriptions.length} prescription
              {prescriptions.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No prescriptions created yet
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Doctor</TableHead>
                      <TableHead className="font-semibold">Medicines</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions
                      .slice()
                      .sort((a, b) => Number(b.date - a.date))
                      .map((prescription) => (
                        <TableRow key={prescription.id.toString()} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(prescription.date)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">Dr. {prescription.doctorName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{prescription.medicines.length} medicine(s)</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrint(prescription)}
                              className="gap-2"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Prescription Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create Prescription</DialogTitle>
            <DialogDescription>Add medicines and doctor information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prescription-patient">
                  Patient <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedPatientId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedPatientId(BigInt(value));
                    setSelectedVisitId(null);
                  }}
                >
                  <SelectTrigger id="prescription-patient">
                    <SelectValue placeholder="Choose patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visit">
                  Clinical Visit <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedVisitId?.toString() || ""}
                  onValueChange={(value) => setSelectedVisitId(BigInt(value))}
                  disabled={!selectedPatientId}
                >
                  <SelectTrigger id="visit">
                    <SelectValue placeholder="Choose visit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicalHistory.map((visit) => (
                      <SelectItem key={visit.id.toString()} value={visit.id.toString()}>
                        {formatDate(visit.date)} - {visit.diagnosis.slice(0, 40)}
                        {visit.diagnosis.length > 40 ? "..." : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">
                Doctor Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doctor"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Enter doctor name"
                required
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Medicines</Label>
                <Button type="button" size="sm" variant="outline" onClick={handleAddMedicine} className="gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Add Medicine
                </Button>
              </div>

              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Medicine {index + 1}</span>
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMedicine(index)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Medicine Name</Label>
                          <Input
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                            placeholder="e.g., Paracetamol"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Dosage</Label>
                          <Input
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                            placeholder="e.g., 500mg"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Frequency</Label>
                          <Input
                            value={medicine.frequency}
                            onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                            placeholder="e.g., 3 times daily"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Duration</Label>
                          <Input
                            value={medicine.duration}
                            onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                            placeholder="e.g., 7 days"
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPrescription.isPending || !selectedPatientId || !selectedVisitId}
                className="gap-2"
              >
                {createPrescription.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Prescription
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl print-only">
          {selectedPrescription && (
            <div className="prescription-print space-y-8 p-8">
              {/* Header */}
              <div className="text-center border-b-2 border-primary pb-6">
                <h1 className="font-display text-3xl font-bold text-primary mb-2">Medical Prescription</h1>
                <p className="text-sm text-muted-foreground">OPD Management System</p>
              </div>

              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-muted-foreground border-b pb-1">
                    Patient Information
                  </h3>
                  {(() => {
                    const patient = getPatientDetails(selectedPrescription.patientId);
                    return (
                      <>
                        <div className="flex gap-2">
                          <span className="font-medium min-w-[80px]">Name:</span>
                          <span>{patient?.name || "N/A"}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium min-w-[80px]">Age:</span>
                          <span>{patient?.age.toString()} years</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium min-w-[80px]">Gender:</span>
                          <span className="capitalize">{patient?.gender}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium min-w-[80px]">Contact:</span>
                          <span>{patient?.contactNumber}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-muted-foreground border-b pb-1">
                    Prescription Details
                  </h3>
                  <div className="flex gap-2">
                    <span className="font-medium min-w-[80px]">Date:</span>
                    <span>{formatDate(selectedPrescription.date)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium min-w-[80px]">Doctor:</span>
                    <span>Dr. {selectedPrescription.doctorName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium min-w-[80px]">Rx ID:</span>
                    <span className="font-mono text-sm">#{selectedPrescription.id.toString()}</span>
                  </div>
                </div>
              </div>

              {/* Medicines */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b-2 border-primary pb-2">
                  ℞ Prescribed Medicines
                </h3>
                <div className="space-y-4">
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-lg">{medicine.name}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Dosage:</span>
                              <p className="font-medium">{medicine.dosage}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>
                              <p className="font-medium">{medicine.frequency}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span>
                              <p className="font-medium">{medicine.duration}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-border pt-6 space-y-4">
                <div className="flex justify-end">
                  <div className="text-center">
                    <div className="border-t-2 border-foreground w-48 mx-auto mb-2"></div>
                    <p className="font-semibold">Dr. {selectedPrescription.doctorName}</p>
                    <p className="text-sm text-muted-foreground">Doctor's Signature</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This is a computer-generated prescription. Please follow the dosage instructions carefully.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
