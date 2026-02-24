import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetAllPatients, useGetClinicalHistory, useCreateClinicalVisit } from "../hooks/useQueries";
import { Activity, Loader2, Plus, Calendar, FileText, TrendingUp, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Vitals } from "../backend.d";

export default function ClinicalRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<bigint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    treatmentPlan: "",
    bloodPressure: "",
    temperature: "",
    pulse: "",
    weight: "",
  });

  const { data: patients = [] } = useGetAllPatients();
  const { data: clinicalHistory = [], isLoading } = useGetClinicalHistory(selectedPatientId);
  const createVisit = useCreateClinicalVisit();

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      const symptomsArray = formData.symptoms
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const treatmentArray = formData.treatmentPlan
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const vitals: Vitals = {
        bloodPressure: formData.bloodPressure || undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        pulse: formData.pulse ? BigInt(parseInt(formData.pulse)) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      await createVisit.mutateAsync({
        patientId: selectedPatientId,
        date: BigInt(Date.now() * 1_000_000), // Convert to nanoseconds
        symptoms: symptomsArray,
        diagnosis: formData.diagnosis.trim(),
        treatmentPlan: treatmentArray,
        vitals,
      });

      toast.success("Clinical visit recorded successfully");
      setFormData({
        symptoms: "",
        diagnosis: "",
        treatmentPlan: "",
        bloodPressure: "",
        temperature: "",
        pulse: "",
        weight: "",
      });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to record clinical visit");
      console.error(error);
    }
  };

  const formatDate = (nanoTimestamp: bigint) => {
    const ms = Number(nanoTimestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Patient Selection */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Clinical Records</CardTitle>
              <CardDescription>View and manage patient clinical history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <Label>Select Patient</Label>
              <Select
                value={selectedPatientId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedPatientId(value ? BigInt(value) : null);
                  setShowAddForm(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                      {patient.name} - {patient.age.toString()} yrs - {patient.contactNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPatientId && !showAddForm && (
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Clinical Visit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Visit Form */}
      {selectedPatientId && showAddForm && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display">Record New Visit</CardTitle>
            <CardDescription>
              Patient: {selectedPatient?.name} (#{selectedPatientId.toString().slice(0, 6)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vitals Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Vitals
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="bp">Blood Pressure</Label>
                    <Input
                      id="bp"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                      placeholder="120/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temp">Temperature (°F)</Label>
                    <Input
                      id="temp"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      placeholder="98.6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pulse">Pulse (bpm)</Label>
                    <Input
                      id="pulse"
                      type="number"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                      placeholder="72"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="70"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Clinical Details */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">
                    Symptoms <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="List symptoms (one per line)"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">
                    Diagnosis <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">
                    Treatment Plan <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="treatment"
                    value={formData.treatmentPlan}
                    onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                    placeholder="List treatment steps (one per line)"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createVisit.isPending} className="gap-2">
                  {createVisit.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Save Visit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clinical History */}
      {selectedPatientId && !showAddForm && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display">Clinical History</CardTitle>
            <CardDescription>
              {selectedPatient?.name} - {clinicalHistory.length} visit{clinicalHistory.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : clinicalHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No clinical visits recorded yet
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {clinicalHistory
                    .slice()
                    .sort((a, b) => Number(b.date - a.date))
                    .map((visit) => (
                      <Card key={visit.id.toString()} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{formatDate(visit.date)}</span>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                              #{visit.id.toString().slice(0, 6)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Vitals */}
                          {(visit.vitals.bloodPressure || visit.vitals.temperature || visit.vitals.pulse || visit.vitals.weight) && (
                            <div className="flex flex-wrap gap-3">
                              {visit.vitals.bloodPressure && (
                                <Badge variant="secondary" className="gap-1.5">
                                  <TrendingUp className="h-3 w-3" />
                                  BP: {visit.vitals.bloodPressure}
                                </Badge>
                              )}
                              {visit.vitals.temperature && (
                                <Badge variant="secondary">Temp: {visit.vitals.temperature}°F</Badge>
                              )}
                              {visit.vitals.pulse && (
                                <Badge variant="secondary">Pulse: {visit.vitals.pulse.toString()}</Badge>
                              )}
                              {visit.vitals.weight && (
                                <Badge variant="secondary">Weight: {visit.vitals.weight}kg</Badge>
                              )}
                            </div>
                          )}

                          {/* Symptoms */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Symptoms:</h4>
                            <ul className="space-y-1">
                              {visit.symptoms.map((symptom, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{symptom}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Diagnosis */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Diagnosis:</h4>
                            <p className="text-sm text-foreground bg-accent/10 p-3 rounded-md">
                              {visit.diagnosis}
                            </p>
                          </div>

                          {/* Treatment Plan */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Treatment Plan:</h4>
                            <ul className="space-y-1">
                              {visit.treatmentPlan.map((step, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-success font-semibold mt-0.5">{idx + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
