'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { mockPayments, formatCurrency, formatDateTime, formatDate } from '@/lib/mock-data';
import type { Payment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IndianRupee,
  Eye,
  Download,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesStatus;
  });

  const totalRevenue = mockPayments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const refundedAmount = mockPayments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const columns: Column<Payment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      cell: (payment) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {payment.transactionId}
        </code>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      cell: (payment) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={payment.student?.avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {payment.student?.firstName.charAt(0)}
              {payment.student?.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {payment.student?.firstName} {payment.student?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{payment.student?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      cell: (payment) => (
        <span className="text-sm text-foreground truncate max-w-[200px] block">
          {payment.course?.title}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment) => (
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      cell: (payment) => (
        <Badge variant="outline" className="text-xs">
          {payment.paymentMethod || 'PhonePe'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment) => (
        <Badge
          variant={
            payment.status === 'success'
              ? 'default'
              : payment.status === 'pending'
              ? 'secondary'
              : payment.status === 'refunded'
              ? 'outline'
              : 'destructive'
          }
          className={
            payment.status === 'success'
              ? 'bg-success'
              : payment.status === 'refunded'
              ? 'border-warning text-warning'
              : ''
          }
        >
          {payment.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
          {payment.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
          {payment.status === 'refunded' && <RefreshCcw className="h-3 w-3 mr-1" />}
          {payment.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (payment) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(payment.createdAt)}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (payment: Payment) => setSelectedPayment(payment),
    },
    {
      label: 'Download Receipt',
      icon: <Download className="h-4 w-4" />,
      onClick: (payment: Payment) => console.log('Download receipt', payment),
    },
    {
      label: 'Initiate Refund',
      icon: <RefreshCcw className="h-4 w-4" />,
      onClick: (payment: Payment) => console.log('Refund', payment),
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Payments"
        subtitle="Track and manage all payment transactions"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={IndianRupee}
            trend={{ value: 18, isPositive: true }}
            subtitle="vs last month"
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
          <StatsCard
            title="Pending Payments"
            value={formatCurrency(pendingAmount)}
            icon={Clock}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
          <StatsCard
            title="Refunded"
            value={formatCurrency(refundedAmount)}
            icon={RefreshCcw}
            iconColor="text-chart-5"
            iconBgColor="bg-chart-5/10"
          />
          <StatsCard
            title="Total Transactions"
            value={mockPayments.length}
            icon={CreditCard}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="ml-auto bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredPayments}
          columns={columns}
          actions={actions}
          searchPlaceholder="Search by transaction ID or student..."
          searchKey="transactionId"
        />

        {/* Payment Detail Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="sm:max-w-[550px]">
            {selectedPayment && (
              <>
                <DialogHeader>
                  <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                    <Badge
                      variant={selectedPayment.status === 'success' ? 'default' : 'secondary'}
                      className={`text-sm py-1 px-3 ${selectedPayment.status === 'success' ? 'bg-success' : ''}`}
                    >
                      {selectedPayment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Transaction ID</p>
                      <code className="text-sm bg-muted px-2 py-1 rounded block">
                        {selectedPayment.transactionId}
                      </code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">PhonePe Transaction ID</p>
                      <code className="text-sm bg-muted px-2 py-1 rounded block">
                        {selectedPayment.phonepeTransactionId || '-'}
                      </code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="text-sm font-medium">{selectedPayment.paymentMethod}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Currency</p>
                      <p className="text-sm font-medium">{selectedPayment.currency}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{formatDateTime(selectedPayment.createdAt)}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium mb-3">Student Details</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedPayment.student?.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedPayment.student?.firstName.charAt(0)}
                          {selectedPayment.student?.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedPayment.student?.firstName} {selectedPayment.student?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.student?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium mb-3">Course Details</p>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{selectedPayment.course?.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPayment.course?.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                      Close
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                    {selectedPayment.status === 'success' && (
                      <Button variant="destructive">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Initiate Refund
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
