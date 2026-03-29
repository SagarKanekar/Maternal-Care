import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchDoctors,
  fetchMothers,
  fetchActiveAssignments,
  assignDoctorToMother,
  type AssignmentView,
} from "@/lib/assignments";
import type { UserProfile, Assignment } from "@/lib/auth";
import { signOutCurrentUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCw, UserCheck } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mothers, setMothers] = useState<UserProfile[]>([]);
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // motherUid being saved

  // local dropdown selections: motherUid -> selected doctorUid
  const [selections, setSelections] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, d, a] = await Promise.all([
        fetchMothers(),
        fetchDoctors(),
        fetchActiveAssignments(),
      ]);
      setMothers(m);
      setDoctors(d);
      setAssignments(a);

      // Pre-populate dropdowns with current assignments
      const initial: Record<string, string> = {};
      m.forEach((mother) => {
        const existing = a.find((asgn) => asgn.motherUid === mother.uid);
        if (existing) {
          initial[mother.uid] = existing.doctorUid;
        }
      });
      setSelections(initial);
    } catch (err: any) {
      toast.error("Failed to load data: " + (err?.message ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const buildAssignmentViews = (): AssignmentView[] => {
    return mothers.map((mother) => {
      const existing = assignments.find((a) => a.motherUid === mother.uid);
      const assignedDoctor = existing
        ? doctors.find((d) => d.uid === existing.doctorUid) ?? null
        : null;
      return {
        motherUid: mother.uid,
        motherName: mother.name || mother.displayName || mother.email,
        motherEmail: mother.email,
        assignedDoctorUid: existing?.doctorUid ?? null,
        assignedDoctorName: assignedDoctor
          ? assignedDoctor.name || assignedDoctor.displayName || assignedDoctor.email
          : null,
        assignmentId: existing?.id ?? null,
      };
    });
  };

  const handleAssign = async (motherUid: string) => {
    const selectedDoctorUid = selections[motherUid];
    if (!selectedDoctorUid) {
      toast.error("Please select a doctor first.");
      return;
    }
    const adminUid = user?.uid;
    if (!adminUid) {
      toast.error("You must be logged in to assign a doctor.");
      return;
    }
    setSaving(motherUid);
    try {
      await assignDoctorToMother(motherUid, selectedDoctorUid, adminUid);
      toast.success("Assignment saved successfully.");
      // Refresh assignments list
      const updated = await fetchActiveAssignments();
      setAssignments(updated);
    } catch (err: any) {
      toast.error("Failed to save assignment: " + (err?.message ?? "Unknown error"));
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = async () => {
    await signOutCurrentUser();
    navigate("/login");
  };

  const views = buildAssignmentViews();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage doctor–mother assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mothers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mothers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{doctors.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Assignment Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading data…</p>
              </div>
            ) : mothers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No mothers registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mother</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead>Reassign</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {views.map((row) => (
                      <TableRow key={row.motherUid}>
                        <TableCell className="font-medium">{row.motherName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.motherEmail}</TableCell>
                        <TableCell>
                          {row.assignedDoctorName ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <UserCheck className="h-3.5 w-3.5" />
                              {row.assignedDoctorName}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doctors.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">No doctors available</span>
                          ) : (
                            <Select
                              value={selections[row.motherUid] ?? ""}
                              onValueChange={(val) =>
                                setSelections((prev) => ({ ...prev, [row.motherUid]: val }))
                              }
                            >
                              <SelectTrigger className="w-52">
                                <SelectValue placeholder="Select doctor…" />
                              </SelectTrigger>
                              <SelectContent>
                                {doctors.map((doc) => (
                                  <SelectItem key={doc.uid} value={doc.uid}>
                                    {doc.name || doc.displayName || doc.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={
                              saving === row.motherUid ||
                              !selections[row.motherUid] ||
                              doctors.length === 0
                            }
                            onClick={() => handleAssign(row.motherUid)}
                          >
                            {saving === row.motherUid ? "Saving…" : "Save"}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
