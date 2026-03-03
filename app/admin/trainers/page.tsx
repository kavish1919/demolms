'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  Users,
  Loader2,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trainer {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  trainerId: string | null;
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users?role=trainer');
      const data = await res.json();
      if (data.success) {
        setTrainers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch trainers', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
    fetchCourses();
  }, [fetchTrainers, fetchCourses]);

  const filteredTrainers = trainers.filter((trainer) => {
    const q = searchQuery.toLowerCase();
    return (
      trainer.firstName.toLowerCase().includes(q) ||
      trainer.lastName.toLowerCase().includes(q) ||
      trainer.email.toLowerCase().includes(q) ||
      trainer.fullName.toLowerCase().includes(q)
    );
  });

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'trainer' }),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: 'Trainer created successfully' });
        setIsAddDialogOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
        fetchTrainers();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (trainer: Trainer) => {
    if (!confirm(`Are you sure you want to delete ${trainer.firstName} ${trainer.lastName}?`)) return;

    try {
      const res = await fetch(`/api/users/${trainer.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Trainer deleted' });
        fetchTrainers();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (trainer: Trainer) => {
    try {
      const res = await fetch(`/api/users/${trainer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !trainer.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: trainer.isActive ? 'Trainer deactivated' : 'Trainer activated' });
        fetchTrainers();
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    }
  };

  const handleAssignCourse = async (courseId: string, trainerId: string | null) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: trainerId ? 'Course assigned' : 'Course unassigned' });
        fetchCourses();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trainers</h1>
          <p className="text-muted-foreground">
            Manage {trainers.length} trainers from the database
          </p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-white">
                <Plus className="h-4 w-4" />
                Add Trainer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass-card">
              <DialogHeader>
                <DialogTitle>Add New Trainer</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new trainer to the database.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTrainer}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Amit"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Kumar"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="amit@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary text-white" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Add Trainer'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Assign Course Dialog */}
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent className="sm:max-w-[500px] glass-card">
              <DialogHeader>
                <DialogTitle>Assign Courses to {selectedTrainer?.firstName}</DialogTitle>
                <DialogDescription>
                  Select the courses this trainer is responsible for.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {coursesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No courses available.</p>
                ) : (
                  courses.map((course) => {
                    const isAssignedToThisTrainer = course.trainerId === selectedTrainer?.id;
                    const isAssignedToOtherTrainer = course.trainerId && course.trainerId !== selectedTrainer?.id;

                    return (
                      <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{course.title}</span>
                          {isAssignedToOtherTrainer && (
                            <span className="text-xs text-amber-500">Already assigned to another trainer</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isAssignedToThisTrainer ? "default" : "outline"}
                          className={isAssignedToThisTrainer ? "bg-success hover:bg-success/90 text-white" : ""}
                          onClick={() => handleAssignCourse(course.id, isAssignedToThisTrainer ? null : selectedTrainer!.id)}
                        >
                          {isAssignedToThisTrainer ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Assigned</>
                          ) : (
                            'Assign'
                          )}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsAssignDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          Total: {trainers.length}
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3 bg-success/10 text-success border-success/30">
          Active: {trainers.filter((t) => t.isActive).length}
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3 bg-destructive/10 text-destructive border-destructive/30">
          Pending: {trainers.filter((t) => !t.isActive).length}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search trainers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading / Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrainers.map((trainer) => (
              <div key={trainer.id} className="glass-card rounded-xl p-6 card-3d group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage
                        src={trainer.avatarUrl || '/placeholder.svg'}
                        alt={`${trainer.firstName} ${trainer.lastName}`}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                        {trainer.firstName[0]}
                        {trainer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {trainer.firstName} {trainer.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{trainer.role}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleActive(trainer)}>
                        {trainer.isActive ? (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedTrainer(trainer);
                        setIsAssignDialogOpen(true);
                      }}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Assign Courses
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(trainer)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status */}
                <div className="mb-4">
                  {trainer.isActive ? (
                    <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">Pending</Badge>
                  )}
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{trainer.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <BookOpen className="h-4 w-4" />
                    <span>{courses.filter(c => c.trainerId === trainer.id).length} Assigned Courses</span>
                  </div>
                </div>

                {/* Joined */}
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  Joined: {new Date(trainer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          {filteredTrainers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No trainers found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add a new trainer</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
