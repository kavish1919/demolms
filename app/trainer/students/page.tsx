'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  BookOpen,
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
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

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const localStorage = getLocalStorage();
        const token = localStorage?.getItem('lms_token') || '';
        
        const response = await fetch(`${API_URL}/enrollments/trainer/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        
        const result = await response.json();
        setStudents(result.data || []);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((item) =>
    item.student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.enrollment.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueStudents = students.reduce((acc, item) => {
    const existing = acc.find(s => s.student.id === item.student.id);
    if (!existing) {
      acc.push(item);
    }
    return acc;
  }, [] as EnrolledStudent[]);

  const activeStudents = students.filter(s => s.enrollment.status === 'active').length;
  const completedStudents = [...new Set(students.filter(s => s.enrollment.status === 'completed').map(s => s.student.id))].length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground">View students enrolled in your courses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{uniqueStudents.length}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Learners</p>
                <p className="text-2xl font-bold">{activeStudents}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 p-2.5">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedStudents}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-2.5">
                <Users className="h-5 w-5 text-white" />
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
            placeholder="Search students..."
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
          <span className="ml-2 text-muted-foreground">Loading students...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && students.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No students found</p>
          <p className="text-muted-foreground">Students will appear here when they enroll in your courses</p>
        </div>
      )}

      {/* Students Table */}
      {!isLoading && !error && filteredStudents.length > 0 && (
        <Card className="glass-card border-0 card-3d">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[250px]">Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((item) => (
                  <TableRow key={item.enrollment.id} className="border-border">
                    <TableCell>
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
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{item.student.email}</span>
                          </div>
                          {item.student.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{item.student.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{item.enrollment.courseTitle}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.enrollment.status === 'completed' ? 'default' : 'secondary'}
                        className={item.enrollment.status === 'completed' ? 'bg-success text-white' : ''}
                      >
                        {item.enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 w-24">
                        <div className="flex items-center justify-between text-xs">
                          <span>{item.enrollment.progressPercent}%</span>
                        </div>
                        <Progress value={item.enrollment.progressPercent} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.enrollment.enrolledAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
