"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Layers,
  MessageSquare,
  PenLine,
  PlayCircle,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { mockEnrollments } from "@/lib/mock-data";

// Type definition for Course to match API response
interface Course {
  id: string;
  title: string;
  category: string;
  isActive: boolean;
  enrollmentCount: number;
  maxStudents: number;
  rating: number;
  fee: number;
  trainerId: string;
}

const upcomingSessions = [
  {
    title: "Deep Dive: React Performance",
    time: "Today · 3:00 PM",
    format: "Live Workshop",
    cohort: "FSWD 12",
  },
  {
    title: "Office Hours: Sprint 4",
    time: "Tomorrow · 11:00 AM",
    format: "AMA",
    cohort: "FSWD 12",
  },
  {
    title: "Design Critique Circle",
    time: "Friday · 7:30 PM",
    format: "Breakout",
    cohort: "Design Lab",
  },
];

const quickActions = [
  { label: "Schedule sprint retro", icon: CalendarDays },
  { label: "Record micro-lesson", icon: PlayCircle },
  { label: "Send cohort pulse", icon: MessageSquare },
  { label: "Upload resources", icon: Layers },
];

const reviewQueue = [
  { title: "Module 05 capstone", course: "Full Stack Web Dev", items: 6, eta: "Review by tonight" },
  { title: "Design critique decks", course: "UI/UX Masterclass", items: 3, eta: "Due tomorrow" },
];

const broadcastNotes = [
  {
    title: "Community pulse",
    detail: "91% learners feel confident heading into project week.",
    tone: "positive",
  },
  {
    title: "Support needed",
    detail: "Three students flagged blockers on deployment pipelines.",
    tone: "warning",
  },
];

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainerData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/courses?trainerId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch trainer dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  // Derived data based on courses
  const totalStudentsCount = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
  const avgRating = courses.length > 0
    ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length
    : 0;

  // Using some mock data for progress/enrollments until those APIs are real
  const trainerEnrollments = mockEnrollments.filter((enrollment) =>
    courses.some(c => c.id === enrollment.courseId)
  );

  const avgProgress =
    trainerEnrollments.length === 0
      ? 0
      : Math.round(
        trainerEnrollments.reduce((sum, enrollment) => sum + (enrollment.progressPercent || 0), 0) /
        trainerEnrollments.length
      );

  const focusStudents = trainerEnrollments.slice(0, 4).map((enrollment) => ({
    id: enrollment.studentId,
    name: `${enrollment.student?.firstName ?? "Learner"} ${enrollment.student?.lastName ?? ""}`.trim(),
    course: enrollment.course?.title ?? "Course",
    status: enrollment.status,
    progress: enrollment.progressPercent,
  }));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      label: "Active Students",
      value: totalStudentsCount,
      change: "+3 this week",
      icon: Users,
      accent: "from-sky-500 to-blue-600",
    },
    {
      label: "Live Courses",
      value: courses.length,
      change: "2 launching soon",
      icon: Layers,
      accent: "from-purple-500 to-indigo-600",
    },
    {
      label: "Avg. Rating",
      value: avgRating.toFixed(1),
      change: "Top 5% mentors",
      icon: Star,
      accent: "from-amber-400 to-orange-500",
    },
    {
      label: "Monthly Earnings",
      value: `₹${(courses.reduce((sum, course) => sum + course.fee * 0.4, 0) / 1000).toFixed(1)}k`,
      change: "+12% vs last month",
      icon: DollarSign,
      accent: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-slate-900 via-primary to-slate-800 text-white">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.3em] text-white/70">Mission Control</p>
            <h2 className="text-3xl font-semibold leading-snug">Good evening, {user?.firstName}. Cohorts are aligned and thriving.</h2>
            <p className="mt-3 text-white/70">
              Next up: {upcomingSessions[0].title}. Prep deck, assign breakout leaders, and drop the reading list.
            </p>
          </div>
          <div className="min-w-[260px] rounded-2xl bg-white/10 p-5 text-white">
            <p className="text-sm text-white/70">Today&apos;s readiness</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-semibold">{avgProgress}%</span>
              <span className="text-xs text-white/70">avg learner progress</span>
            </div>
            <Progress value={avgProgress} className="mt-4 h-2 bg-white/30" />
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Zero overdue check-ins
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-lg shadow-primary/5">
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${stat.accent} p-3 text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card className="border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming rituals</CardTitle>
                <p className="text-sm text-muted-foreground">Orchestrate the next three touchpoints</p>
              </div>
              <Button variant="ghost" className="gap-2">
                View calendar
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.title}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-muted/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">{session.cohort}</p>
                    <h3 className="text-lg font-semibold text-foreground">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">{session.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                      {session.format}
                    </Badge>
                    <Button size="sm" className="gap-2">
                      Launch room
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardHeader>
              <CardTitle>Course healthboard</CardTitle>
              <p className="text-sm text-muted-foreground">Pulse across every cohort you lead</p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {courses.map((course) => (
                <div key={course.id} className="rounded-2xl border p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{course.category}</p>
                      <h3 className="text-base font-semibold text-foreground">{course.title}</h3>
                    </div>
                    <Badge variant={course.isActive ? "outline" : "destructive"}>
                      {course.isActive ? "Live" : "Paused"}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Enrollment</span>
                      <span className="font-medium text-foreground">{course.enrollmentCount} / {course.maxStudents ?? 50}</span>
                    </div>
                    <Progress value={(course.enrollmentCount / (course.maxStudents ?? 50)) * 100} />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-muted-foreground col-span-2 py-8 text-center bg-muted/20 rounded-xl border border-dashed">
                  No courses assigned yet. Contact Admin to get started.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-muted/40">
            <CardHeader>
              <CardTitle>Action shortcuts</CardTitle>
              <p className="text-sm text-muted-foreground">Deploy what your learners need right now</p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" className="h-auto justify-start gap-3 rounded-2xl bg-background px-4 py-3">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Students to spotlight</CardTitle>
              <p className="text-sm text-muted-foreground">Blend praise with timely nudges</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {focusStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3 rounded-2xl border px-3 py-2.5">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.course}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3.5 w-3.5" />
                      {student.progress}% progress · {student.status}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {focusStudents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No active students to show.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardHeader>
              <CardTitle>Review queue</CardTitle>
              <p className="text-sm text-muted-foreground">Ship feedback while momentum is high</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewQueue.map((item) => (
                <div key={item.title} className="rounded-2xl border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.course}</p>
                    </div>
                    <Badge variant="outline">{item.items} submissions</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item.eta}
                  </div>
                  <Button variant="ghost" className="mt-2 h-auto justify-start gap-2 px-0 text-sm text-primary">
                    Open workspace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-amber-50 via-background to-white">
            <CardHeader>
              <CardTitle>Broadcast intel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {broadcastNotes.map((note) => (
                <div key={note.title} className="rounded-2xl border border-dashed px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {note.tone === "positive" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                    {note.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{note.detail}</p>
                </div>
              ))}
              <Button className="mt-2 w-full gap-2">
                Draft announcement
                <PenLine className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
