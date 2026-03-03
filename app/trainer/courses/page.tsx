'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Loader2,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

interface TrainerCourse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  durationHours: number;
  fee: number;
  discountFee?: number;
  isActive: boolean;
  isFeatured: boolean;
  maxStudents?: number;
  enrollmentCount: number;
  rating: number;
  category?: string;
  level: string;
  createdAt: string;
}

interface EnrolledStudent {
  enrollment: {
    id: string;
    courseId: string;
    courseTitle: string;
    status: string;
    progressPercent: number;
    enrolledAt: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
}

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState<TrainerCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCourse, setSelectedCourse] = useState<TrainerCourse | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const localStorage = getLocalStorage();
        const token = localStorage?.getItem('lms_token') || '';
        
        const response = await fetch(`${API_URL}/enrollments/trainer/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const result = await response.json();
        setCourses(result.data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const fetchEnrolledStudents = async (courseId: string) => {
    setIsStudentsLoading(true);
    try {
      const localStorage = getLocalStorage();
      const token = localStorage?.getItem('lms_token') || '';
      
      const response = await fetch(`${API_URL}/enrollments/trainer/courses/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const result = await response.json();
      setEnrolledStudents(result.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setEnrolledStudents([]);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const handleViewStudents = (course: TrainerCourse) => {
    setSelectedCourse(course);
    setShowStudentsDialog(true);
    fetchEnrolledStudents(course.id);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
  const activeCourses = courses.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Manage your assigned courses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 p-2.5">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{activeCourses}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-2.5">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No courses assigned</p>
          <p className="text-muted-foreground">Contact admin to get courses assigned</p>
        </div>
      )}

      {/* Courses Table */}
      {!isLoading && !error && filteredCourses.length > 0 && (
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[300px]">Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-muted">
                          {course.thumbnailUrl ? (
                            <Image
                              src={course.thumbnailUrl}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{course.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {course.shortDescription || course.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{course.level || 'Beginner'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{course.durationHours}h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course.enrollmentCount}/{course.maxStudents || '∞'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.isActive ? 'default' : 'secondary'}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudents(course)}>
                            <User className="h-4 w-4 mr-2" />
                            View Students
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Students Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enrolled Students</DialogTitle>
            <DialogDescription>
              {selectedCourse?.title} - {enrolledStudents.length} student(s) enrolled
            </DialogDescription>
          </DialogHeader>
          
          {isStudentsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading students...</span>
            </div>
          )}

          {!isStudentsLoading && enrolledStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No students enrolled</p>
              <p className="text-muted-foreground">This course has no enrollments yet</p>
            </div>
          )}

          {!isStudentsLoading && enrolledStudents.length > 0 && (
            <div className="space-y-3">
              {enrolledStudents.map((item) => (
                <div
                  key={item.enrollment.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {item.student.firstName?.[0]}{item.student.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {item.student.firstName} {item.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.student.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={item.enrollment.status === 'completed' ? 'default' : 'secondary'}
                      className={item.enrollment.status === 'completed' ? 'bg-success text-white' : ''}
                    >
                      {item.enrollment.status}
                    </Badge>
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.enrollment.progressPercent}% progress
                      </span>
                    </div>
                    <Progress value={item.enrollment.progressPercent} className="h-1.5 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
