import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllPatients, useUpdatePatient } from "../hooks/useQueries";
import { Search, Edit, Loader2, Users, Save, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Patient, Gender } from "../backend.d";

interface PatientListProps {
  onSelectPatient?: (patientId: bigint) => void;
}

export default function PatientList({ onSelectPatient }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    age: string;
    gender: Gender;
    contactNumber: string;
    address: string;
    medicalHistory: string;
  } | null>(null);

  const { data: patients = [], isLoading } = useGetAllPatients();
  const updatePatient = useUpdatePatient();

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(search) ||
      patient.contactNumber.toLowerCase().includes(search) ||
      patient.id.toString().includes(search)
    );
  });

  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      address: patient.address,
      medicalHistory: patient.medicalHistory.join("\n"),
    });
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !editFormData) return;

    try {
      const medicalHistoryArray = editFormData.medicalHistory
        .split("\n")
        .map(item => item.trim())
        .filter(item => item.length > 0);

      await updatePatient.mutateAsync({
        id: selectedPatient.id,
        name: editFormData.name.trim(),
        age: BigInt(parseInt(editFormData.age)),
        gender: editFormData.gender,
        contactNumber: editFormData.contactNumber.trim(),
        address: editFormData.address.trim(),
        medicalHistory: medicalHistoryArray,
      });

      toast.success("Patient updated successfully");
      setEditDialogOpen(false);
      setSelectedPatient(null);
      setEditFormData(null);
    } catch (error) {
      toast.error("Failed to update patient");
      console.error(error);
    }
  };

  const formatGender = (gender: Gender) => {
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Patient List</CardTitle>
              <CardDescription>
                {filteredPatients.length} {filteredPatients.length === 1 ? "patient" : "patients"} found
              </CardDescription>
            </div>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "No patients found matching your search" : "No patients registered yet"}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Age</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id.toString()} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs">
                      #{patient.id.toString().slice(0, 6)}
                    </TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {patient.age.toString()} yrs
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {formatGender(patient.gender)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{patient.contactNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{patient.address || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(patient)}
                        className="gap-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Patient Information</DialogTitle>
            <DialogDescription>
              Update patient details. ID: #{selectedPatient?.id.toString()}
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    min="0"
                    max="150"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select
                    value={editFormData.gender}
                    onValueChange={(value) => setEditFormData({ ...editFormData, gender: value as Gender })}
                  >
                    <SelectTrigger id="edit-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-contact">Contact Number</Label>
                  <Input
                    id="edit-contact"
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-medicalHistory">Medical History</Label>
                <Textarea
                  id="edit-medicalHistory"
                  value={editFormData.medicalHistory}
                  onChange={(e) => setEditFormData({ ...editFormData, medicalHistory: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePatient.isPending}
                  className="gap-2"
                >
                  {updatePatient.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
