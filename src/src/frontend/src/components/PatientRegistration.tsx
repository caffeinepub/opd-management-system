import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRegisterPatient } from "../hooks/useQueries";
import { Gender } from "../backend.d";
import { Loader2, UserPlus } from "lucide-react";

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as Gender | "",
    contactNumber: "",
    address: "",
    medicalHistory: "",
  });

  const registerPatient = useRegisterPatient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter patient name");
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      toast.error("Please enter valid age");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select gender");
      return;
    }
    if (!formData.contactNumber.trim()) {
      toast.error("Please enter contact number");
      return;
    }

    try {
      const medicalHistoryArray = formData.medicalHistory
        .split("\n")
        .map(item => item.trim())
        .filter(item => item.length > 0);

      await registerPatient.mutateAsync({
        name: formData.name.trim(),
        age: BigInt(parseInt(formData.age)),
        gender: formData.gender as Gender,
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        medicalHistory: medicalHistoryArray,
      });

      toast.success("Patient registered successfully");
      
      // Clear form
      setFormData({
        name: "",
        age: "",
        gender: "",
        contactNumber: "",
        address: "",
        medicalHistory: "",
      });
    } catch (error) {
      toast.error("Failed to register patient");
      console.error(error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display">Patient Registration</CardTitle>
            <CardDescription>Register a new patient in the system</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="150"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.male}>Male</SelectItem>
                  <SelectItem value={Gender.female}>Female</SelectItem>
                  <SelectItem value={Gender.other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="Enter contact number"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="Enter medical history (one item per line)"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Add each condition or note on a new line
            </p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={registerPatient.isPending}
          >
            {registerPatient.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Register Patient
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
