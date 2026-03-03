'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  CreditCard,
  Loader2,
  Eye,
  Download,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

interface StudentPayment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  phonepeTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  course: {
    title: string;
    shortDescription?: string;
  };
}

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const localStorage = getLocalStorage();
        const token = localStorage?.getItem('lms_token') || '';
        const response = await fetch(`${API_URL}/payments/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success) {
          setPayments(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredPayments = payments.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  const totalSpent = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCcw className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Payments</h1>
        <p className="text-muted-foreground">View your payment history and transaction details</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 p-2.5">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 p-2.5">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No payments found</p>
          <p className="text-muted-foreground">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="glass-card border-0 card-3d">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {statusIcon(payment.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{payment.course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {payment.paymentMethod || 'PhonePe'}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      {payment.transactionId && (
                        <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block font-mono">
                          {payment.transactionId}
                        </code>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
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
                        className={payment.status === 'success' ? 'bg-success' : ''}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[500px]">
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
                    <code className="text-sm bg-muted px-2 py-1 rounded block font-mono">
                      {selectedPayment.transactionId || '-'}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">PhonePe Txn ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded block font-mono">
                      {selectedPayment.phonepeTransactionId || '-'}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="text-sm font-medium">{selectedPayment.paymentMethod || '-'}</p>
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
                  <p className="text-sm font-medium mb-3">Course</p>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{selectedPayment.course.title}</p>
                    {selectedPayment.course.shortDescription && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPayment.course.shortDescription}
                      </p>
                    )}
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
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
