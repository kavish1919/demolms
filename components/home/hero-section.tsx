"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  Environment, 
  PerspectiveCamera,
  RoundedBox,
  Text,
  MeshDistortMaterial,
  Sphere
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, GraduationCap, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import type * as THREE from "three";

function FloatingBook({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + rotation[1];
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef} position={position} rotation={rotation}>
        <RoundedBox args={[0.8, 1, 0.1]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.75, 0.95, 0.02]} radius={0.01} smoothness={4} position={[0, 0, 0.06]}>
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </RoundedBox>
      </group>
    </Float>
  );
}

function GlowingSphere({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.2} floatIntensity={1}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function FloatingGraduation({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef} position={position}>
        {/* Cap base */}
        <RoundedBox args={[1.2, 0.1, 1.2]} radius={0.02} smoothness={4} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#1e40af" metalness={0.5} roughness={0.3} />
        </RoundedBox>
        {/* Cap top */}
        <RoundedBox args={[0.8, 0.4, 0.8]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e40af" metalness={0.5} roughness={0.3} />
        </RoundedBox>
        {/* Tassel */}
        <mesh position={[0.5, 0.35, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene3D() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
      <Environment preset="city" />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
      
      <FloatingGraduation position={[0, 0.5, 0]} />
      
      <FloatingBook position={[-2.5, 0.5, -1]} rotation={[0.2, 0.5, 0.1]} color="#3b82f6" />
      <FloatingBook position={[2.5, -0.3, -1]} rotation={[-0.1, -0.3, 0.05]} color="#8b5cf6" />
      <FloatingBook position={[-1.5, -1, 0.5]} rotation={[0.1, 0.8, -0.1]} color="#06b6d4" />
      <FloatingBook position={[1.8, 1, 0]} rotation={[-0.2, -0.6, 0.1]} color="#10b981" />
      
      <GlowingSphere position={[-3, 1.5, -2]} color="#60a5fa" scale={0.8} />
      <GlowingSphere position={[3, -1.5, -2]} color="#a78bfa" scale={0.6} />
      <GlowingSphere position={[0, -2, -1]} color="#34d399" scale={0.5} />
      <GlowingSphere position={[-2, -1.5, 1]} color="#f472b6" scale={0.4} />
      <GlowingSphere position={[2.5, 1.8, -1]} color="#fbbf24" scale={0.5} />
    </>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 opacity-80">
        {mounted && (
          <Canvas>
            <Scene3D />
          </Canvas>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Smart E-Learning Platform</span>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Codevocado
                </span>
                <br />
                <span className="text-foreground">Learning Management</span>
              </h1>
              
              <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0 text-pretty">
                Transform your educational institution with our cutting-edge LMS. 
                Deliver courses, track progress, and generate data-driven insights 
                with a beautiful, modern interface.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 bg-transparent">
                  <Link href="#demo">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="glass-card rounded-xl p-4 text-center card-3d">
                  <div className="flex justify-center mb-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-xs text-muted-foreground">Active Students</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center card-3d">
                  <div className="flex justify-center mb-2">
                    <div className="rounded-full bg-accent/10 p-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center card-3d">
                  <div className="flex justify-center mb-2">
                    <div className="rounded-full bg-success/10 p-2">
                      <GraduationCap className="h-5 w-5 text-success" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">98%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right side - spacer for 3D content */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="h-12 w-6 rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
