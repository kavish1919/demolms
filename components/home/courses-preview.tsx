"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const courses = [
  {
    id: 1,
    title: "Full Stack Web Development",
    description: "Master React, Node.js, and modern web technologies from scratch to deployment.",
    image: "/courses/web-dev.jpg",
    instructor: "John Smith",
    duration: "12 weeks",
    students: 1250,
    rating: 4.9,
    price: 14999,
    originalPrice: 24999,
    category: "Development",
    level: "Beginner to Advanced",
  },
  {
    id: 2,
    title: "Data Science & Machine Learning",
    description: "Learn Python, pandas, scikit-learn, and build real-world ML projects.",
    image: "/courses/data-science.jpg",
    instructor: "Sarah Johnson",
    duration: "16 weeks",
    students: 890,
    rating: 4.8,
    price: 17999,
    originalPrice: 29999,
    category: "Data Science",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    description: "Create stunning user interfaces and experiences with Figma and design thinking.",
    image: "/courses/ui-ux.jpg",
    instructor: "Mike Chen",
    duration: "8 weeks",
    students: 675,
    rating: 4.7,
    price: 9999,
    originalPrice: 16999,
    category: "Design",
    level: "All Levels",
  },
  {
    id: 4,
    title: "Cloud Computing with AWS",
    description: "Deploy, scale, and manage applications on Amazon Web Services.",
    image: "/courses/cloud.jpg",
    instructor: "Emily Davis",
    duration: "10 weeks",
    students: 520,
    rating: 4.9,
    price: 12999,
    originalPrice: 21999,
    category: "Cloud",
    level: "Intermediate",
  },
];

function CourseCard({ course, index }: { course: typeof courses[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <Card className="group glass-card overflow-hidden card-3d h-full border-0">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Discount badge */}
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            {discount}% OFF
          </Badge>
          
          {/* Category badge */}
          <Badge variant="secondary" className="absolute top-3 right-3 glass">
            {course.category}
          </Badge>
        </div>

        <CardContent className="p-5">
          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {course.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>

          {/* Instructor */}
          <p className="text-sm text-muted-foreground mb-3">
            By <span className="text-foreground font-medium">{course.instructor}</span>
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.students}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{course.rating}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              ₹{course.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ₹{course.originalPrice.toLocaleString()}
            </span>
          </div>

          {/* Enroll button */}
          <Button size="sm" className="gradient-primary text-white group/btn">
            Enroll
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function CoursesPreview() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section className="relative py-24 overflow-hidden bg-muted/30" id="courses">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              <span>Popular Courses</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Learn From Industry{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Experts
              </span>
            </h2>
          </div>

          <Button asChild variant="outline" className="glass-card border-primary/20 w-fit bg-transparent">
            <Link href="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Courses grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
