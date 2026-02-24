import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useGetAllPatients,
  useGetAllFollowUps,
  useScheduleFollowUp,
  useMarkFollowUpCompleted,
  useCancelFollowUp,
} from "../hooks/useQueries";
import { Calendar, Loader2, Plus, CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { toast } from "sonner";
import type { FollowUp } from "../backend.d";

export default function FollowUps() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<bigint | null>(null);
  const [filterPatient, setFilterPatient] = useState<string>("all");
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "09:00",
    notes: "",
  });

  const { data: patients = [] } = useGetAllPatients();
  const { data: followUps = [], isLoading } = useGetAllFollowUps();
  const scheduleFollowUp = useScheduleFollowUp();
  const markCompleted = useMarkFollowUpCompleted();
  const cancelFollowUp = useCancelFollowUp();

  const filteredFollowUps = followUps.filter((followUp) => {
    if (filterPatient === "all") return true;
    return followUp.patientId.toString() === filterPatient;
  });

  const upcomingFollowUps = filteredFollowUps
    .filter((f) => !f.completed && Number(f.appointmentDate) > Date.now() * 1_000_000)
    .sort((a, b) => Number(a.appointmentDate - b.appointmentDate));

  const pastFollowUps = filteredFollowUps
    .filter((f) => f.completed || Number(f.appointmentDate) <= Date.now() * 1_000_000)
    .sort((a, b) => Number(b.appointmentDate - a.appointmentDate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      const nanoTimestamp = BigInt(dateTime.getTime() * 1_000_000);

      await scheduleFollowUp.mutateAsync({
        patientId: selectedPatientId,
        appointmentDate: nanoTimestamp,
        notes: formData.notes.trim(),
      });

      toast.success("Follow-up scheduled successfully");
      setShowAddDialog(false);
      setSelectedPatientId(null);
      setFormData({
        appointmentDate: "",
        appointmentTime: "09:00",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to schedule follow-up");
      console.error(error);
    }
  };

  const handleMarkCompleted = async (id: bigint) => {
    try {
      await markCompleted.mutateAsync(id);
      toast.success("Follow-up marked as completed");
    } catch (error) {
      toast.error("Failed to update follow-up");
      console.error(error);
    }
  };

  const handleCancel = async (id: bigint) => {
    try {
      await cancelFollowUp.mutateAsync(id);
      toast.success("Follow-up cancelled");
    } catch (error) {
      toast.error("Failed to cancel follow-up");
      console.error(error);
    }
  };

  const getPatientName = (patientId: bigint) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || "Unknown";
  };

  const formatDate = (nanoTimestamp: bigint) => {
    const ms = Number(nanoTimestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (nanoTimestamp: bigint) => {
    const ms = Number(nanoTimestamp) / 1_000_000;
    return new Date(ms).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">Follow-up Appointments</CardTitle>
                <CardDescription>Schedule and manage patient follow-ups</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Follow-up
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filter by Patient:</Label>
            <Select value={filterPatient} onValueChange={setFilterPatient}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
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

      {/* Upcoming Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>{upcomingFollowUps.length} scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingFollowUps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No upcoming follow-ups scheduled
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingFollowUps.map((followUp) => (
                    <TableRow key={followUp.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {getPatientName(followUp.patientId)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(followUp.appointmentDate)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {followUp.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className="status-pending gap-1.5">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkCompleted(followUp.id)}
                            className="gap-2 text-success hover:text-success"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(followUp.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Past Appointments</CardTitle>
          <CardDescription>{pastFollowUps.length} completed or past due</CardDescription>
        </CardHeader>
        <CardContent>
          {pastFollowUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No past follow-ups</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastFollowUps.map((followUp) => (
                    <TableRow key={followUp.id.toString()}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {getPatientName(followUp.patientId)}
                      </TableCell>
                      <TableCell>{formatDateTime(followUp.appointmentDate)}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {followUp.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            followUp.completed ? "status-completed gap-1.5" : "bg-muted text-muted-foreground"
                          }
                        >
                          {followUp.completed ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </>
                          ) : (
                            "Missed"
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Schedule Follow-up</DialogTitle>
            <DialogDescription>Create a new follow-up appointment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">
                Select Patient <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedPatientId?.toString() || ""}
                onValueChange={(value) => setSelectedPatientId(BigInt(value))}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Choose patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id.toString()} value={patient.id.toString()}>
                      {patient.name} - {patient.contactNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={getTodayDateString()}
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes for this appointment..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleFollowUp.isPending || !selectedPatientId} className="gap-2">
                {scheduleFollowUp.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Schedule
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
