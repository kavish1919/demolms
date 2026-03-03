'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { StatsCard } from '@/components/admin/stats-card';
import { RevenueChart, EnrollmentChart, CourseDistribution } from '@/components/admin/dashboard-charts';
import {
  mockDashboardStats,
  mockPayments,
  mockEnquiries,
  formatCurrency,
  formatDateTime,
} from '@/lib/mock-data';
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const courseDistributionData = [
  { name: 'Web Dev', value: 45, color: 'oklch(0.55 0.18 250)' },
  { name: 'Data Science', value: 38, color: 'oklch(0.65 0.15 200)' },
  { name: 'Mobile', value: 28, color: 'oklch(0.7 0.12 280)' },
  { name: 'DevOps', value: 22, color: 'oklch(0.6 0.18 145)' },
];

export default function AdminDashboard() {
  const stats = mockDashboardStats;

  const [dbStats, setDbStats] = useState({ totalStudents: 0, totalTrainers: 0, totalUsers: 0, activeUsers: 0, recentSignups: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setDbStats(d.stats); })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Students"
            value={dbStats.totalStudents}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            subtitle="from database"
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatsCard
            title="Total Trainers"
            value={dbStats.totalTrainers}
            icon={GraduationCap}
            trend={{ value: 8, isPositive: true }}
            subtitle="from database"
            iconColor="text-chart-2"
            iconBgColor="bg-chart-2/10"
          />
          <StatsCard
            title="Active Courses"
            value={stats.activeCourses}
            icon={BookOpen}
            subtitle={`of ${stats.totalCourses} total`}
            iconColor="text-chart-3"
            iconBgColor="bg-chart-3/10"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={IndianRupee}
            trend={{ value: 23, isPositive: true }}
            subtitle="vs last month"
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Pending Enquiries"
            value={stats.pendingEnquiries}
            icon={MessageSquare}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
          <StatsCard
            title="Trainer Applications"
            value={stats.pendingApplications}
            icon={UserPlus}
            iconColor="text-chart-5"
            iconBgColor="bg-chart-5/10"
          />
          <StatsCard
            title="Today's Attendance"
            value={`${stats.todayAttendance}%`}
            icon={CheckCircle2}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={stats.revenueTrend} />
          <EnrollmentChart data={stats.enrollmentTrend} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Distribution */}
          <CourseDistribution data={courseDistributionData} />

          {/* Recent Payments */}
          <div className="glass-card card-3d rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Payments</h3>
              <Link href="/admin/payments">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {mockPayments.slice(0, 4).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
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
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {payment.course?.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge
                      variant={
                        payment.status === 'success'
                          ? 'default'
                          : payment.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Enquiries */}
          <div className="glass-card card-3d rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Enquiries</h3>
              <Link href="/admin/enquiries">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {mockEnquiries.slice(0, 4).map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="flex items-start justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {enquiry.studentName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {enquiry.course?.title || 'General Enquiry'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(enquiry.createdAt)}
                      </span>
                    </div>
                  </div>
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
                    className="text-[10px] ml-2"
                  >
                    {enquiry.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card card-3d rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/admin/students">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                <Users className="h-6 w-6 text-primary" />
                <span>Add Student</span>
              </Button>
            </Link>
            <Link href="/admin/courses">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                <BookOpen className="h-6 w-6 text-chart-2" />
                <span>Create Course</span>
              </Button>
            </Link>
            <Link href="/admin/notifications">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                <TrendingUp className="h-6 w-6 text-chart-3" />
                <span>Send Notification</span>
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                <IndianRupee className="h-6 w-6 text-success" />
                <span>View Reports</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
