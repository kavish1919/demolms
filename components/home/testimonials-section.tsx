"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, MessageSquare } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Full Stack Developer",
    company: "TCS",
    avatar: "",
    content: "Codevocado LMS transformed my career. The structured courses and hands-on projects helped me land my dream job. The trainers are incredibly supportive!",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Data Scientist",
    company: "Infosys",
    avatar: "",
    content: "The Data Science course was comprehensive and practical. The interactive assignments and real-world datasets made learning engaging and effective.",
    rating: 5,
  },
  {
    id: 3,
    name: "Anita Patel",
    role: "UI/UX Designer",
    company: "Wipro",
    avatar: "",
    content: "I loved the design curriculum! From Figma basics to advanced prototyping, every module was well-structured. The certificate helped me get promoted.",
    rating: 5,
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Cloud Architect",
    company: "Amazon",
    avatar: "",
    content: "The AWS course content is top-notch. Real cloud labs and industry-relevant projects gave me the confidence to clear my certification exam.",
    rating: 5,
  },
  {
    id: 5,
    name: "Sneha Reddy",
    role: "Software Engineer",
    company: "Microsoft",
    avatar: "",
    content: "Best investment in my education. The mentorship program and career guidance helped me transition from a fresher to a software engineer at a top MNC.",
    rating: 5,
  },
  {
    id: 6,
    name: "Amit Kumar",
    role: "DevOps Engineer",
    company: "Google",
    avatar: "",
    content: "The platform is intuitive and the content quality is exceptional. I particularly appreciated the 24/7 doubt support and community forums.",
    rating: 5,
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass-card border-0 h-full card-3d group">
        <CardContent className="p-6 relative">
          {/* Quote icon */}
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Quote className="h-12 w-12 text-primary" />
          </div>

          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          {/* Content */}
          <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
            "{testimonial.content}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section className="relative py-24 overflow-hidden" id="testimonials">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium text-primary mb-6">
            <MessageSquare className="h-4 w-4" />
            <span>Success Stories</span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-6 text-balance">
            What Our{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Students Say
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground text-pretty">
            Join thousands of successful learners who have transformed their careers 
            with Codevocado LMS.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
