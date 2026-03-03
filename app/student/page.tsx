"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import Link from "next/link";
import { mockCourses, mockStudents } from "@/lib/mock-data";

const enrolledCourses = [
  {
    id: 1,
    title: "Full Stack Web Development",
    instructor: "John Smith",
    progress: 65,
    nextLesson: "React Hooks Deep Dive",
    duration: "45 min",
    thumbnail: "/courses/web-dev.jpg",
  },
  {
    id: 2,
    title: "Data Science & Machine Learning",
    instructor: "Sarah Johnson",
    progress: 30,
    nextLesson: "Introduction to Pandas",
    duration: "1h 20min",
    thumbnail: "/courses/data-science.jpg",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    instructor: "Mike Chen",
    progress: 85,
    nextLesson: "Prototyping in Figma",
    duration: "55 min",
    thumbnail: "/courses/ui-ux.jpg",
  },
];

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
  const stats = [
    {
      title: "Courses Enrolled",
      value: "5",
      change: "+2 this month",
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
      value: "3",
      change: "2 pending",
      icon: Award,
      color: "from-emerald-500 to-green-500",
    },
    {
      title: "Current Streak",
      value: "12 days",
      change: "Keep it up!",
      icon: Flame,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass-card rounded-2xl p-6 gradient-primary text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Student!</h1>
            <p className="text-white/80">
              You have 3 courses in progress. Continue where you left off!
            </p>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90 w-fit">
            <Play className="mr-2 h-4 w-4" />
            Continue Learning
          </Button>
        </div>
      </div>

      {/* Stats grid */}
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
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-success mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Continue Learning</h2>
            <Button variant="ghost" asChild>
              <Link href="/student/courses">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="glass-card border-0 card-3d overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail placeholder */}
                    <div className="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-primary/50" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        </div>
                        <Badge variant="secondary">{course.progress}%</Badge>
                      </div>

                      <Progress value={course.progress} className="h-2 mb-3" />

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <span className="text-foreground font-medium">Next:</span> {course.nextLesson}
                          <span className="text-muted-foreground"> · {course.duration}</span>
                        </div>
                        <Button size="sm" className="gradient-primary text-white">
                          <Play className="mr-1 h-3 w-3" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Upcoming Classes */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="rounded-lg bg-primary/10 p-2 h-fit">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">{cls.title}</h4>
                    <p className="text-xs text-muted-foreground">{cls.instructor}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{cls.time}</span>
                      <span>·</span>
                      <span>{cls.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent">
                View Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      achievement.earned
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30 border-transparent opacity-50"
                    }`}
                  >
                    <div className={`rounded-full p-2 ${achievement.earned ? "bg-primary/10" : "bg-muted"}`}>
                      <achievement.icon className={`h-5 w-5 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-xs text-center font-medium">{achievement.title}</span>
                    {achievement.earned && (
                      <CheckCircle className="h-3 w-3 text-success" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
