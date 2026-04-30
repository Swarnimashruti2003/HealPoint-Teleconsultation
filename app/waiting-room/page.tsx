'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Clock, 
  Video, 
  Mic, 
  Camera, 
  Wifi, 
  CheckSquare, 
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firestoreGet } from '@/lib/firebase-rest';

function WaitingRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('id');
  const doctorName = searchParams.get('doctor');
  
  const [waitingTime, setWaitingTime] = useState(30);
  const [queuePosition, setQueuePosition] = useState(3);
  const [isCalling, setIsCalling] = useState(false);
  const [checklist, setChecklist] = useState({
    camera: false,
    mic: false,
    reports: false,
    environment: false,
    internet: false
  });

  useEffect(() => {
    if (!appointmentId) return;

    const interval = setInterval(async () => {
      try {
        const appt = await firestoreGet('appointments', appointmentId);
        if (appt) {
          setQueuePosition(appt.queuePosition || 3);
          if (appt.status === 'in-progress' || appt.status === 'completed') {
            setWaitingTime(0); 
          }
        }
      } catch (err) {
        console.error('Error fetching appointment:', err);
      }
    }, 5000);

    const timer = setInterval(() => {
      setWaitingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [appointmentId]);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isChecklistComplete = Object.values(checklist).every(v => v);
  const completedCount = Object.values(checklist).filter(Boolean).length;

  const joinCall = () => {
    if (isChecklistComplete && waitingTime === 0) {
      router.push(`/ehr?appointmentId=${appointmentId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-[#0A1628] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl mb-12">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00BFA6]/10 blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[100px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[#00BFA6] text-xs font-black uppercase tracking-widest mb-6 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00BFA6] animate-pulse" />
              Live Waiting Room
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Dr. {doctorName} will be <br />
              <span className="text-[#00BFA6]">with you shortly</span>
            </h1>
            <p className="text-gray-400 font-medium text-lg mb-8 max-w-md">
              Please stay on this page. Your consultation will start automatically when the doctor is ready.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white/5 py-3 px-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-[#00BFA6]/20 text-[#00BFA6] rounded-xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1 text-nowrap">Est. Wait Time</p>
                  <p className="text-xl font-bold tracking-tight">{waitingTime}s</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 py-3 px-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1 text-nowrap">Queue Position</p>
                  <p className="text-xl font-bold tracking-tight">#{queuePosition}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-[320px] aspect-square rounded-[48px] bg-white/5 border border-white/10 flex items-center justify-center group overflow-hidden">
             {/* Simulating Video Feed / Avatar */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-transparent to-[#00BFA6]/5 opacity-50" />
             <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-500">
               <div className="w-24 h-24 bg-[#0A1628] rounded-full flex items-center justify-center text-[#00BFA6] shadow-2xl border border-white/5 relative">
                 <Video size={40} />
                 <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-[#0A1628]" />
               </div>
               <p className="text-sm font-bold text-gray-400">Waiting for Stream...</p>
             </div>
             
             {/* User Floating Info */}
             <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 text-center">
               <p className="text-xs font-bold text-gray-300">Your Identity Verified</p>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Patient #8271</p>
             </div>
          </div>
        </div>
      </div>

      {/* Pre-Consultation Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#0A1628]">Pre-Call Checklist</h2>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${isChecklistComplete ? 'bg-[#00BFA6]/20 text-[#00BFA6]' : 'bg-gray-100 text-gray-400'}`}>
              {completedCount}/5 Tasks Done
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 'camera', icon: Camera, label: 'Camera access allowed', sub: 'Ensure your room has good lighting' },
              { id: 'mic', icon: Mic, label: 'Microphone permission', sub: 'Test your audio for better clarity' },
              { id: 'internet', icon: Wifi, label: 'High-speed internet', sub: 'Stable connection for video HD' },
              { id: 'reports', icon: FileText, label: 'Medical reports uploaded', sub: 'Past prescriptions or test results' },
              { id: 'environment', icon: ShieldCheck, label: 'Private environment', sub: 'Consult from a quiet, safe place' }
            ].map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => toggleCheck(item.id as any)}
                className={`flex items-center gap-4 p-6 rounded-3xl border transition-all cursor-pointer ${checklist[item.id as keyof typeof checklist] ? 'bg-emerald-50 border-[#00BFA6] shadow-md' : 'bg-white border-gray-100 hover:border-gray-300'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${checklist[item.id as keyof typeof checklist] ? 'bg-[#00BFA6] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                  <item.icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold transition-colors ${checklist[item.id as keyof typeof checklist] ? 'text-[#0A1628]' : 'text-gray-500'}`}>{item.label}</h4>
                  <p className="text-xs text-gray-400 leading-tight">{item.sub}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checklist[item.id as keyof typeof checklist] ? 'bg-[#00BFA6] border-[#00BFA6] scale-110 shadow-lg shadow-emerald-500/20' : 'border-gray-200'}`}>
                   {checklist[item.id as keyof typeof checklist] && <CheckSquare size={14} className="text-white" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-center">
          <div className="bg-yellow-50 rounded-[32px] p-8 border border-yellow-100/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-[#0A1628] shrink-0 transform -rotate-12">
                <AlertCircle size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#0A1628] mb-2 leading-tight">Patient Advisory</h4>
                <p className="text-sm text-yellow-800/70 leading-relaxed mb-4 font-medium italic">
                  &quot;Teleconsultation is for non-emergencies only. If you are experiencing heavy chest pain or breathing difficulties, please visit your nearest hospital immediately.&quot;
                </p>
                <div className="w-12 h-1 bg-yellow-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-8 pb-0">
            <button
               onClick={joinCall}
               disabled={!isChecklistComplete || waitingTime > 0}
               className={`w-full py-6 rounded-3xl text-xl font-black transition-all flex items-center justify-center gap-4 group shadow-xl ${
                 !isChecklistComplete || waitingTime > 0
                 ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
                 : 'bg-[#00BFA6] text-white hover:bg-[#00a68f] hover:translate-y-[-4px] active:scale-95'
               }`}
            >
              {waitingTime > 0 ? (
                <>Waiting for Slot...</>
              ) : isChecklistComplete ? (
                <>
                  Connect with Doctor
                  <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </>
              ) : (
                <>Complete Checklist to Join</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-[#00BFA6]" />
              End-to-End Encrypted Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA6]" /></div>}>
      <WaitingRoomContent />
    </Suspense>
  );
}
