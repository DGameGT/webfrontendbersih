import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import gsap from 'gsap';

// --- KOMPONEN UNTUK LOGO KAMU ---
function Logo() {
  const obj = useLoader(OBJLoader, '/DGXLogo.obj');
  const logoRef = useRef();
  // 'useThree' adalah hook untuk mendapatkan akses ke properti scene, termasuk kamera
  const { camera } = useThree();

  // Animasi saat logo muncul, sekarang menggunakan timeline
  useEffect(() => {
    if (logoRef.current) {
      const material = logoRef.current.material;
      if (material) {
        material.transparent = true;
        material.opacity = 0; // Mulai dari tidak terlihat

        // Atur posisi awal kamera untuk efek 'zoom dekat'
        const initialCameraZ = 15; // Jarak kamera awal (makin besar, makin dekat)
        const finalCameraZ = 5;   // Jarak kamera normal
        camera.position.z = initialCameraZ;

        // Buat timeline animasi
        const tl = gsap.timeline();

        // 1. Fade in logo (durasi 1 detik, jeda 3 detik)
        tl.to(material, {
          opacity: 1,
          duration: 1,
          delay: 3
        });

        // 2. Zoom out kamera (durasi 2 detik, mulai bersamaan dengan fade in)
        tl.to(camera.position, {
          z: finalCameraZ,
          duration: 2,
          ease: 'power2.out'
        }, "-=1"); // Mulai 1 detik setelah fade in dimulai, jadi mereka overlap

        // 3. Putar logo 360 derajat (durasi 2 detik, mulai bersamaan dengan zoom out)
        tl.to(logoRef.current.rotation, {
          y: logoRef.current.rotation.y + (2 * Math.PI), // Putar 360 derajat dari posisi sekarang
          duration: 2,
          ease: 'power2.out'
        }, "<"); // "<" artinya mulai bersamaan dengan animasi sebelumnya
      }
    }
  }, []); // Hanya dijalankan sekali saat komponen dimuat

  return (
    <primitive
      ref={logoRef}
      object={obj}
      scale={0.8}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]} // Posisi awal rotasi
    />
  );
}

// --- KOMPONEN LOADING SCREEN ---
function Loader() {
  const { progress } = useProgress();
  const [isDone, setIsDone] = useState(false);
  const loadingRef = useRef();

  useEffect(() => {
    if (progress === 100) {
      gsap.to(loadingRef.current, {
        opacity: 0,
        duration: 1.5,
        onComplete: () => setIsDone(true)
      });
    }
  }, [progress]);

  return (
    <div
      ref={loadingRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        color: '#00ff41',
        display: isDone ? 'none' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
        fontFamily: 'monospace',
        flexDirection: 'column',
        zIndex: 999,
      }}
    >
      <p>DGX SYSTEM BOOTING... {Math.round(progress)}%</p>
      <p>LOADING CORE VISUALS...</p>
    </div>
  );
}

// --- KOMPONEN APP UTAMA ---
export default function App() {
  return (
    <>
      <Loader />
      <Canvas>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Logo />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </>
  );
}