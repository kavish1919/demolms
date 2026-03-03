"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Rocket, CheckCircle } from "lucide-react";
import Link from "next/link";
import type * as THREE from "three";

function AnimatedSphere({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[scale, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function CTAScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <AnimatedSphere position={[-3, 1, -2]} color="#3b82f6" scale={0.8} />
      <AnimatedSphere position={[3, -1, -3]} color="#8b5cf6" scale={0.6} />
      <AnimatedSphere position={[0, 2, -4]} color="#06b6d4" scale={0.5} />
      <AnimatedSphere position={[-2, -1.5, -2]} color="#10b981" scale={0.4} />
      <AnimatedSphere position={[2, 1.5, -2]} color="#f472b6" scale={0.5} />
    </>
  );
}

const benefits = [
  "Access to 500+ premium courses",
  "Lifetime course access",
  "Industry-recognized certificates",
  "24/7 mentor support",
];

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative py-24 overflow-hidden" id="cta">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40">
        {mounted && (
          <Canvas>
            <CTAScene />
          </Canvas>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/90" />

      <div className="container relative mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white mb-8">
            <Rocket className="h-4 w-4" />
            <span>Start Your Learning Journey Today</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
            Ready to Transform Your Career?
          </h2>

          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto text-pretty">
            Join thousands of learners who have achieved their goals with Codevocado LMS. 
            Start your free trial today and unlock your potential.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-white/90 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-white" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Email signup */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white h-12"
            />
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg h-12 px-8 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Alternative CTA */}
          <p className="text-white/70 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
