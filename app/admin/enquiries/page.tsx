'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { mockEnquiries, mockUsers, formatDateTime } from '@/lib/mock-data';
import type { Enquiry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Mail,
  Phone,
  BookOpen,
  Clock,
  Eye,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';

const admins = mockUsers.filter(u => u.role === 'admin');

export default function EnquiriesPage() {
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const columns: Column<Enquiry>[] = [
    {
      key: 'studentName',
      header: 'Name',
      cell: (enquiry) => (
        <div>
          <p className="font-medium text-foreground">{enquiry.studentName}</p>
          <p className="text-xs text-muted-foreground">{enquiry.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (enquiry) => (
        <span className="text-sm text-muted-foreground">{enquiry.phone || '-'}</span>
      ),
    },
    {
      key: 'course',
      header: 'Course Interest',
      cell: (enquiry) => (
        <span className="text-sm text-foreground">
          {enquiry.course?.title || 'General Enquiry'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (enquiry) => (
        <Badge
          variant={
            enquiry.status === 'new'
              ? 'default'
              : enquiry.status === 'contacted'
              ? 'secondary'
              : enquiry.status === 'converted'
              ? 'outline'
              : 'destructive'
          }
          className={
            enquiry.status === 'converted'
              ? 'border-success text-success bg-success/10'
              : enquiry.status === 'new'
              ? 'bg-primary'
              : ''
          }
        >
          {enquiry.status}
        </Badge>
      ),
    },
    {
      key: 'assignedCounsellor',
      header: 'Assigned To',
      cell: (enquiry) => (
        <span className="text-sm text-muted-foreground">
          {enquiry.assignedCounsellor
            ? `${enquiry.assignedCounsellor.firstName} ${enquiry.assignedCounsellor.lastName}`
            : '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (enquiry) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(enquiry.createdAt)}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (enquiry: Enquiry) => setSelectedEnquiry(enquiry),
    },
    {
      label: 'Mark as Contacted',
      icon: <Phone className="h-4 w-4" />,
      onClick: (enquiry: Enquiry) => console.log('Contact', enquiry),
    },
    {
      label: 'Mark as Converted',
      icon: <CheckCircle2 className="h-4 w-4" />,
      onClick: (enquiry: Enquiry) => console.log('Convert', enquiry),
    },
    {
      label: 'Close Enquiry',
      icon: <XCircle className="h-4 w-4" />,
      onClick: (enquiry: Enquiry) => console.log('Close', enquiry),
      variant: 'destructive' as const,
    },
  ];

  const newCount = mockEnquiries.filter(e => e.status === 'new').length;
  const contactedCount = mockEnquiries.filter(e => e.status === 'contacted').length;
  const convertedCount = mockEnquiries.filter(e => e.status === 'converted').length;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Student Enquiries"
        subtitle="Manage and respond to student enquiries"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Enquiries"
            value={mockEnquiries.length}
            icon={MessageSquare}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatsCard
            title="New Enquiries"
            value={newCount}
            icon={Clock}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
          <StatsCard
            title="Contacted"
            value={contactedCount}
            icon={Phone}
            iconColor="text-chart-2"
            iconBgColor="bg-chart-2/10"
          />
          <StatsCard
            title="Converted"
            value={convertedCount}
            icon={CheckCircle2}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={mockEnquiries}
          columns={columns}
          actions={actions}
          searchPlaceholder="Search by name or email..."
          searchKey="studentName"
        />

        {/* Enquiry Detail Dialog */}
        <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedEnquiry && (
              <>
                <DialogHeader>
                  <DialogTitle>Enquiry Details</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedEnquiry.studentName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedEnquiry.email}
                        </span>
                        {selectedEnquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedEnquiry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={selectedEnquiry.status === 'new' ? 'default' : 'secondary'}
                      className={selectedEnquiry.status === 'converted' ? 'bg-success' : ''}
                    >
                      {selectedEnquiry.status}
                    </Badge>
                  </div>

                  {selectedEnquiry.course && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <BookOpen className="h-4 w-4" />
                        Interested Course
                      </div>
                      <p className="font-medium">{selectedEnquiry.course.title}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm text-muted-foreground">Message</Label>
                    <p className="mt-1 p-3 rounded-lg bg-muted/50">
                      {selectedEnquiry.message || 'No message provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assign Counsellor</Label>
                      <Select defaultValue={selectedEnquiry.assignedCounsellorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select counsellor" />
                        </SelectTrigger>
                        <SelectContent>
                          {admins.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.firstName} {admin.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Update Status</Label>
                      <Select defaultValue={selectedEnquiry.status}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea
                      placeholder="Add notes about this enquiry..."
                      defaultValue={selectedEnquiry.notes}
                      rows={3}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Received: {formatDateTime(selectedEnquiry.createdAt)}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                      Close
                    </Button>
                    <Button className="gradient-primary">
                      Save Changes
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
