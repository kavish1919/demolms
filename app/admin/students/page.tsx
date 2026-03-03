'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { mockUsers, formatDate } from '@/lib/mock-data';
import type { User } from '@/lib/types';
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
import { Plus, Mail, Phone, Calendar, Shield, ShieldOff, Eye, Pencil, Trash2 } from 'lucide-react';

const students = mockUsers.filter((u) => u.role === 'student');

export default function StudentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Student',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
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
      cell: (user) => (
        <span className="text-sm text-muted-foreground">{user.phone || '-'}</span>
      ),
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      cell: (user) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {user.referralCode || '-'}
        </code>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <div className="flex items-center gap-2">
          {user.isBlocked ? (
            <Badge variant="destructive" className="text-xs">Blocked</Badge>
          ) : user.isActive ? (
            <Badge variant="default" className="text-xs bg-success">Active</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Inactive</Badge>
          )}
          {user.emailVerified && (
            <Badge variant="outline" className="text-xs">Verified</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
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
      onClick: (user: User) => setSelectedStudent(user),
    },
    {
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      onClick: (user: User) => console.log('Edit', user),
    },
    {
      label: 'Block/Unblock',
      icon: <Shield className="h-4 w-4" />,
      onClick: (user: User) => console.log('Toggle block', user),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user: User) => console.log('Delete', user),
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
              Active: {students.filter(s => s.isActive && !s.isBlocked).length}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3 bg-destructive/10 text-destructive border-destructive/30">
              Blocked: {students.filter(s => s.isBlocked).length}
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
                  Create a new student account. They will receive login credentials via email.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary">
                    Create Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Data Table */}
        <DataTable
          data={students}
          columns={columns}
          actions={actions}
          searchPlaceholder="Search students..."
          searchKey="email"
          onExport={() => console.log('Export students')}
        />

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
                      <AvatarImage src={selectedStudent.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {selectedStudent.firstName.charAt(0)}
                        {selectedStudent.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedStudent.isBlocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : selectedStudent.isActive ? (
                          <Badge variant="default" className="bg-success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {selectedStudent.emailVerified && (
                          <Badge variant="outline">Email Verified</Badge>
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
                        <span className="text-sm">Date of Birth</span>
                      </div>
                      <p className="font-medium">
                        {selectedStudent.dateOfBirth
                          ? formatDate(selectedStudent.dateOfBirth)
                          : '-'}
                      </p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Referral Code</span>
                      </div>
                      <code className="font-medium bg-muted px-2 py-1 rounded">
                        {selectedStudent.referralCode || '-'}
                      </code>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                      Close
                    </Button>
                    {selectedStudent.isBlocked ? (
                      <Button variant="default" className="bg-success hover:bg-success/90">
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Unblock
                      </Button>
                    ) : (
                      <Button variant="destructive">
                        <Shield className="h-4 w-4 mr-2" />
                        Block
                      </Button>
                    )}
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
