"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  IndianRupee,
  Star,
  Calendar,
  Play,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDate } from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

interface TrainerCourse {
  id: string;
  title: string;
  shortDescription?: string;
  enrollmentCount: number;
  maxStudents?: number;
  isActive: boolean;
}

interface EnrolledStudent {
  enrollment: {
    id: string;
    courseId: string;
    courseTitle: string;
    status: string;
    progressPercent: number;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TrainerPayment {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}

interface TrainerPaymentData {
  trainerRevenue: number;
  payments: TrainerPayment[];
}

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<TrainerCourse[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [paymentData, setPaymentData] = useState<TrainerPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const localStorage = getLocalStorage();
        const token = localStorage?.getItem('lms_token') || '';
        
        const [coursesRes, studentsRes, paymentsRes] = await Promise.all([
          fetch(`${API_URL}/enrollments/trainer/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/enrollments/trainer/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/payments/trainer`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        if (!coursesRes.ok || !studentsRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const coursesData = await coursesRes.json();
        const studentsData = await studentsRes.json();
        
        setCourses(coursesData.data || []);
        setStudents(studentsData.data || []);

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPaymentData(paymentsData.data || null);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const totalStudents = students.length;
  const activeCourses = courses.filter(c => c.isActive).length;
  const trainerRevenue = paymentData?.trainerRevenue || 0;

  const stats = [
    {
      title: "Courses Taught",
      value: courses.length.toString(),
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Students",
      value: totalStudents.toString(),
      icon: Users,
      color: "from-emerald-500 to-green-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(trainerRevenue),
      icon: IndianRupee,
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Trainer Rating",
      value: "4.7",
      icon: Star,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="glass-card rounded-2xl p-6 gradient-primary text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="text-white/80">
              You have {activeCourses} active course{activeCourses !== 1 ? 's' : ''} and upcoming sessions.
            </p>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90 w-fit">
            <Play className="mr-2 h-4 w-4" />
            Start Class
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card border-0 card-3d">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading courses...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-destructive font-medium">Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No courses assigned</p>
              <p className="text-muted-foreground">Contact admin to get courses assigned</p>
            </div>
          )}

          {!isLoading && !error && courses.length > 0 && (
            <>
              {courses.map((course) => (
                <Card key={course.id} className="glass-card border-0 card-3d">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge>{course.enrollmentCount}/{course.maxStudents || '∞'}</Badge>
                    </div>

                    <Progress value={(course.enrollmentCount || 0) / (course.maxStudents || 1) * 100} className="h-2" />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        <b>{course.enrollmentCount}</b> enrolled
                      </span>
                      <span>{course.isActive ? 'Active' : 'Inactive'}</span>
                    </div>

                    <Button size="sm" className="gradient-primary text-white">
                      Manage Class
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {!isLoading && paymentData && paymentData.payments.length > 0 && (
            <div className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold">Students Who Paid</h2>
              {paymentData.payments.map((payment, index) => (
                <Card key={index} className="glass-card border-0 card-3d">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{payment.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{payment.courseTitle}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                        <Badge className="bg-success">{payment.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="font-medium">React Hooks Live</p>
              <p className="text-xs text-muted-foreground">Today · 6:00 PM</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="font-medium">TypeScript Q&A</p>
              <p className="text-xs text-muted-foreground">Tomorrow · 4:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
