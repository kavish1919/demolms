"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Shield,
  Video,
  FileText,
  Award,
  Clock,
  Smartphone,
  Zap
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Create, organize, and deliver courses with rich multimedia content, assignments, and assessments.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Student Portal",
    description: "Dedicated student dashboard with progress tracking, certificates, and interactive learning tools.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: CreditCard,
    title: "Payment Integration",
    description: "Secure payment processing with PhonePe, multiple payment options, and automated invoicing.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights into student performance, course engagement, and revenue metrics.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated alerts for deadlines, announcements, and personalized learning reminders.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with role-based access control and data encryption.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Video,
    title: "Video Lectures",
    description: "Stream high-quality video content with progress tracking and bookmarking features.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Study Materials",
    description: "Upload and organize PDFs, documents, and resources for easy student access.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Auto-generate beautiful certificates upon course completion with verification.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Clock,
    title: "Flexible Learning",
    description: "Self-paced courses with deadline management and progress milestones.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Learn anywhere with a fully responsive design optimized for all devices.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description: "Lightning-fast load times with optimized infrastructure and CDN delivery.",
    color: "from-amber-500 to-yellow-500",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="glass-card rounded-2xl p-6 h-full card-3d hover:border-primary/30 transition-all duration-300">
        {/* Gradient glow on hover */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}>
            <feature.icon className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section className="relative py-24 overflow-hidden" id="features">
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

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
            <Zap className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-6 text-balance">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transform Learning
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground text-pretty">
            Our comprehensive LMS provides all the tools you need to create, deliver, 
            and manage exceptional learning experiences.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
