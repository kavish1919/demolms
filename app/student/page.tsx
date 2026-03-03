"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle,
  Target,
  Flame,
  LogOut,
  Loader2,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

interface EnrolledCourse {
  id: string;
  title: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  durationHours: number;
  trainer?: {
    firstName: string;
    lastName: string;
  };
  enrollment: {
    status: string;
    progressPercent: number;
  };
}

interface StudentPayment {
  id: string;
  courseId: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  course: {
    title: string;
  };
}

const upcomingClasses = [
  {
    id: 1,
    title: "Live: Advanced React Patterns",
    instructor: "John Smith",
    time: "Today, 3:00 PM",
    duration: "2 hours",
  },
  {
    id: 2,
    title: "Q&A Session: Data Structures",
    instructor: "Sarah Johnson",
    time: "Tomorrow, 10:00 AM",
    duration: "1 hour",
  },
  {
    id: 3,
    title: "Workshop: Figma Plugins",
    instructor: "Mike Chen",
    time: "Wed, 2:00 PM",
    duration: "1.5 hours",
  },
];

const achievements = [
  { id: 1, title: "First Course Completed", icon: Award, earned: true },
  { id: 2, title: "7 Day Streak", icon: Flame, earned: true },
  { id: 3, title: "Quiz Master", icon: Target, earned: true },
  { id: 4, title: "Top Performer", icon: Star, earned: false },
];

export default function StudentDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'student') {
        router.push('/');
        return;
      }
      
      try {
        const localStorage = getLocalStorage();
        const token = localStorage?.getItem('lms_token') || '';
        
        const [coursesRes, paymentsRes] = await Promise.all([
          fetch(`${API_URL}/enrollments/student/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/payments/student`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        if (!coursesRes.ok) {
          const errorText = await coursesRes.text();
          throw new Error(`Failed to fetch enrolled courses: ${coursesRes.status} - ${errorText}`);
        }
        
        const coursesResult = await coursesRes.json();
        setEnrolledCourses(coursesResult.data || []);

        if (paymentsRes.ok) {
          const paymentsResult = await paymentsRes.json();
          setPayments(paymentsResult.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        
        if (errorMessage.includes('No token provided') || errorMessage.includes('Invalid token') || errorMessage.includes('401') || errorMessage.includes('403')) {
          logout();
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [authLoading, user, router, logout]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const completedCount = enrolledCourses.filter(c => c.enrollment.status === 'completed').length;
  const inProgressCount = enrolledCourses.filter(c => c.enrollment.status === 'active').length;
  const totalSpent = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      title: "Courses Enrolled",
      value: enrolledCourses.length.toString(),
      change: inProgressCount > 0 ? `${inProgressCount} in progress` : "No active courses",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Hours Learned",
      value: "127",
      change: "+12 this week",
      icon: Clock,
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Certificates",
      value: completedCount.toString(),
      change: `${enrolledCourses.length - completedCount} in progress`,
      icon: Award,
      color: "from-emerald-500 to-green-500",
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      change: `${payments.length} transactions`,
      icon: IndianRupee,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.firstName} 👋
          </h1>
          <p className="text-muted-foreground">
            You have {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} in progress. Continue where you left off!
          </p>
        </div>

        <Button
          variant="outline"
          className="bg-transparent gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card border-0 card-3d">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-success mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Continue Learning
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/student/courses">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

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

          {!isLoading && !error && enrolledCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No enrolled courses</p>
              <p className="text-muted-foreground">Start learning by enrolling in a course</p>
            </div>
          )}

          {!isLoading && !error && enrolledCourses.length > 0 && (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <Card
                  key={course.id}
                  className="glass-card border-0 card-3d overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {course.trainer?.firstName} {course.trainer?.lastName}
                        </p>
                      </div>
                      <Badge variant="secondary">{course.enrollment.progressPercent}%</Badge>
                    </div>

                    <Progress value={course.enrollment.progressPercent} className="h-2 mb-3" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Status:
                        </span>{" "}
                        {course.enrollment.status} · {course.durationHours}h
                      </div>
                      <Button size="sm" className="gradient-primary text-white">
                        <Play className="mr-1 h-3 w-3" />
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && payments.length > 0 && (
            <div className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold text-foreground">My Payments</h2>
              {payments.map((payment) => (
                <Card key={payment.id} className="glass-card border-0 card-3d">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{payment.course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.paymentMethod || 'PhonePe'} · {formatDate(payment.createdAt)}
                        </p>
                        {payment.transactionId && (
                          <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                            {payment.transactionId}
                          </code>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                        <Badge
                          variant={
                            payment.status === 'success' ? 'default' :
                            payment.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className={payment.status === 'success' ? 'bg-success' : ''}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3 rounded-lg bg-muted/50"
                >
                  <h4 className="font-medium text-sm">{cls.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {cls.instructor}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cls.time} · {cls.duration}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg text-center ${
                    a.earned
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-muted/30 opacity-50"
                  }`}
                >
                  <a.icon className="mx-auto h-5 w-5 mb-2 text-primary" />
                  <p className="text-xs font-medium">{a.title}</p>
                  {a.earned && (
                    <CheckCircle className="h-3 w-3 text-success mx-auto mt-1" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
