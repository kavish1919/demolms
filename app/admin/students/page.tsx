'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Mail, Phone, Calendar, Shield, ShieldOff, Eye, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users?role=student');
      const data = await res.json();
      if (data.success) {
        setStudents(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'student' }),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: 'Student created successfully' });
        setIsAddDialogOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
        fetchStudents();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) return;

    try {
      const res = await fetch(`/api/users/${student.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Student deleted' });
        fetchStudents();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (student: Student) => {
    try {
      const res = await fetch(`/api/users/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !student.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: student.isActive ? 'Student deactivated' : 'Student activated' });
        fetchStudents();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl || '/placeholder.svg'} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {(user.firstName || '?').charAt(0)}
              {(user.lastName || '?').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (user) => <span className="text-sm text-muted-foreground">{user.phone || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <div className="flex items-center gap-2">
          {user.isActive ? (
            <Badge variant="default" className="text-xs bg-success">Active</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Inactive</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      cell: (user) => (
        <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (user: Student) => setSelectedStudent(user),
    },
    {
      label: 'Toggle Active',
      icon: <Shield className="h-4 w-4" />,
      onClick: (user: Student) => handleToggleActive(user),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user: Student) => handleDelete(user),
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Students"
        subtitle={`Manage ${students.length} registered students`}
      />

      <div className="p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              Total: {students.length}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3 bg-success/10 text-success border-success/30">
              Active: {students.filter((s) => s.isActive).length}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3 bg-destructive/10 text-destructive border-destructive/30">
              Inactive: {students.filter((s) => !s.isActive).length}
            </Badge>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Create a new student account. Data will be saved to the database.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Rahul"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Sharma"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Student'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            data={students}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search students..."
            searchKey="email"
            onExport={() => console.log('Export students')}
          />
        )}

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedStudent && (
              <>
                <DialogHeader>
                  <DialogTitle>Student Details</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedStudent.avatarUrl || '/placeholder.svg'} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {(selectedStudent.firstName || '?').charAt(0)}
                        {(selectedStudent.lastName || '?').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedStudent.isActive ? (
                          <Badge variant="default" className="bg-success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Email</span>
                      </div>
                      <p className="font-medium">{selectedStudent.email}</p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">Phone</span>
                      </div>
                      <p className="font-medium">{selectedStudent.phone || '-'}</p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Joined</span>
                      </div>
                      <p className="font-medium">{formatDate(selectedStudent.createdAt)}</p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Last Login</span>
                      </div>
                      <p className="font-medium">
                        {selectedStudent.lastLogin ? formatDate(selectedStudent.lastLogin) : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                      Close
                    </Button>
                    <Button
                      variant={selectedStudent.isActive ? 'destructive' : 'default'}
                      className={!selectedStudent.isActive ? 'bg-success hover:bg-success/90' : ''}
                      onClick={() => {
                        handleToggleActive(selectedStudent);
                        setSelectedStudent(null);
                      }}
                    >
                      {selectedStudent.isActive ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
