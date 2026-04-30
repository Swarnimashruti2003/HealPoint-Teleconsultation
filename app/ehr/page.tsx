'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Activity, 
  Thermometer, 
  Droplets, 
  CalendarCheck,
  Stethoscope,
  Pill,
  Info,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Cloud,
  Languages,
  CheckCircle2,
  Download,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIExplanation, EHRRecord } from '@/lib/types';
import { GoogleGenAI } from "@google/genai";

const MOCK_EHR: EHRRecord = {
  id: 'ehr001',
  consultationDate: new Date().toISOString(),
  vitals: { 
    bloodPressure: '128/84', 
    heartRate: 76,
    temperature: 98.4, 
    spo2: 98, 
    weight: 72 
  },
  diagnosis: { 
    primary: 'Hypertension Stage 1',
    secondary: 'Mild Hyperlipidemia' 
  },
  prescriptions: [
    { name: 'Amlodipine 5mg', dosage: '1 Tablet', frequency: 'Daily (Morning)', duration: '30 Days', purpose: 'Control High Blood Pressure', explanation: 'Calcium channel blocker that relaxes blood vessels.' },
    { name: 'Atorvastatin 10mg', dosage: '1 Tablet', frequency: 'Bedtime', duration: '30 Days', purpose: 'Cholesterol Management', explanation: 'Statins help reduce LDL cholesterol levels.' }
  ],
  doctorNotes: 'Patient advised low sodium diet and regular exercise. Monitor BP weekly.',
  followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
};

function EHRContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  const [activeTab, setActiveTab] = useState<'summary' | 'ai'>('summary');
  const [ehr, setEhr] = useState<EHRRecord>(MOCK_EHR);
  const [aiExplanations, setAiExplanations] = useState<AIExplanation[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLanguage, setAiLanguage] = useState<'en' | 'hi'>('en');

  const fetchAIExplanation = React.useCallback(async (lang: 'en' | 'hi' = 'en') => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please check your secrets.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const medList = ehr.prescriptions
        .map(p => `${p.name} ${p.dosage} ${p.frequency}`)
        .join(', ');
      
      const prompt = `Patient prescribed: ${medList}.
        Explain each medicine: purpose in simple words,
        when to take, one key precaution.
        Current language context: ${lang === 'hi' ? 'Hindi' : 'English'}.
        Return ONLY JSON array no markdown or preamble:
        [{"name": "...", "purpose": "...", "timing": "...", "precaution": "..."}]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "[]";
      const clean = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);
      
      setAiExplanations(data);
      setAiLanguage(lang);
    } catch (err: any) {
      console.error("AI Error:", err);
      if (err.message?.includes("API key not valid")) {
        setAiError("Invalid Gemini API key. Please check your AI Studio secrets.");
      } else {
        setAiError(err.message || "An unexpected error occurred during AI analysis.");
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [ehr.prescriptions]);

  useEffect(() => {
    // Initial fetch of AI explanation
    const timer = setTimeout(() => {
      fetchAIExplanation('en');
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAIExplanation]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-[#00BFA6] font-black uppercase tracking-[0.2em] text-xs mb-3">
             <div className="w-8 h-[1px] bg-[#00BFA6]" />
             Prescription Summary
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0A1628] tracking-tight">Your Health <span className="text-gray-300">Insights</span></h1>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex-1 md:px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'summary' ? 'bg-white text-[#0A1628] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Digital Record
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 md:px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-[#00BFA6] text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
          >
             <Cloud size={16} /> AI Explainer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Data Displays */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'summary' ? (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Vitals Summary Card */}
                <div className="bg-[#0A1628] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#00BFA6]/10 blur-[80px] -mr-32 -mt-32" />
                   <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
                     <Activity className="text-[#00BFA6]" /> Current Vitals
                   </h2>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     {[
                       { label: 'Blood Pressure', value: ehr.vitals.bloodPressure, unit: 'mmHg', icon: Activity, color: 'text-red-400' },
                       { label: 'Heart Rate', value: ehr.vitals.heartRate, unit: 'bpm', icon: Activity, color: 'text-emerald-400' },
                       { label: 'Temperature', value: ehr.vitals.temperature, unit: '°F', icon: Thermometer, color: 'text-orange-400' },
                       { label: 'SpO2', value: ehr.vitals.spo2, unit: '%', icon: Droplets, color: 'text-blue-400' }
                     ].map((vital) => (
                       <div key={vital.label}>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{vital.label}</p>
                         <p className="text-2xl font-black flex items-baseline gap-1">
                           {vital.value}
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{vital.unit}</span>
                         </p>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Prescription Table */}
                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-[#0A1628]">Digital Prescription</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                       <Download size={16} /> PDF Export
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {ehr.prescriptions.map((med, idx) => (
                      <div key={idx} className="group p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-[#00BFA6]/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#00BFA6] shadow-sm">
                              <Pill size={24} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-[#0A1628] leading-tight mb-1">{med.name}</h4>
                              <p className="text-xs text-gray-400 font-medium">{med.purpose}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8 px-4 py-2 bg-white rounded-2xl border border-gray-100/50 shadow-sm self-start md:self-auto">
                            <div>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Dosage</p>
                              <p className="text-xs font-bold text-gray-700">{med.dosage}</p>
                            </div>
                            <div className="w-px h-6 bg-gray-100" />
                            <div>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Frequency</p>
                              <p className="text-xs font-bold text-gray-700">{med.frequency}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Doctor&apos;s Clinical Notes</h4>
                    <p className="text-gray-500 leading-relaxed italic text-sm italic">
                      &quot;{ehr.doctorNotes}&quot;
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* AI Explanation Content */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-100 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-2xl font-black text-[#0A1628] mb-2">HealPoint AI Assistant</h2>
                      <p className="text-sm text-gray-400 font-medium">Simplified medical explanations powered by Gemini</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fetchAIExplanation('en')}
                        className={`p-2 rounded-xl border transition-all ${aiLanguage === 'en' ? 'bg-[#0A1628] text-white border-[#0A1628]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                      >
                        <Languages size={20} />
                      </button>
                      <button 
                        onClick={() => fetchAIExplanation('hi')}
                        className={`px-4 py-2 rounded-xl border transition-all font-bold text-sm ${aiLanguage === 'hi' ? 'bg-[#0A1628] text-white border-[#0A1628]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                      >
                        हिन्दी
                      </button>
                    </div>
                  </div>

                  {isAiLoading ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="relative mx-auto w-20 h-20">
                         <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
                         <div className="absolute inset-0 border-4 border-[#00BFA6] border-t-transparent rounded-full animate-spin" />
                         <Cloud className="absolute inset-0 m-auto text-[#00BFA6]" size={30} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#0A1628]">Analyzing your prescription...</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">Gemini is translating medical jargon into plain language for you.</p>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-[#0A1628] mb-2">Analysis Failed</h3>
                      <p className="text-sm text-gray-500 mb-8">{aiError}</p>
                      <button 
                        onClick={() => fetchAIExplanation(aiLanguage)}
                        className="px-10 py-4 bg-[#0A1628] text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {aiExplanations.map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="relative pl-12"
                        >
                          <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-50 text-[#00BFA6] rounded-xl flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xl font-black text-[#0A1628] mb-1">{item.name}</h4>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] rounded-lg text-[10px] font-black uppercase tracking-wider">
                                  Simplified View
                                </div>
                              </div>
                              <p className="text-gray-500 leading-relaxed">{item.purpose}</p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                               <div className="flex items-start gap-3">
                                 <div className="w-8 h-8 bg-white text-emerald-500 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                   <Clock size={16} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">When to take</p>
                                   <p className="text-sm font-bold text-gray-700">{item.timing}</p>
                                 </div>
                               </div>
                               <div className="flex items-start gap-3">
                                 <div className="w-8 h-8 bg-white text-orange-500 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                   <AlertCircle size={16} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Key Precaution</p>
                                   <p className="text-sm font-bold text-gray-700">{item.precaution}</p>
                                 </div>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Follow-up & Sidebar */}
        <div className="space-y-8">
           <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-100">
             <div className="flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-[#00BFA6] mb-6 relative border border-gray-100">
                  <CalendarCheck size={40} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00BFA6] text-white rounded-lg flex items-center justify-center">
                    <Info size={12} />
                  </div>
               </div>
               <h3 className="text-xl font-bold text-[#0A1628] mb-2 text-nowrap">Schedule Follow-up</h3>
               <p className="text-sm text-gray-400 mb-8">Dr. Sharma has requested a follow-up review after 14 days of this medication.</p>
               
               <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <div className="text-left text-nowrap">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Proposed Date</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(ehr.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <CheckCircle2 size={24} className="text-[#00BFA6]" />
                  </div>
                  
                  <button className="w-full py-4 bg-[#0A1628] text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    Book This Slot <ChevronRight size={18} />
                  </button>
               </div>
             </div>
           </div>

           <div className="bg-[#00BFA6]/10 rounded-3xl p-8 border border-[#00BFA6]/20 relative overflow-hidden group">
              <div className="relative z-10">
                <MessageSquare className="text-[#00BFA6] mb-4" size={32} />
                <h4 className="text-lg font-bold text-[#0A1628] mb-2 leading-tight">Need further clarification?</h4>
                <p className="text-xs text-emerald-800/70 mb-4 font-medium italic">
                  Ask our AI Assistant specifically about side effects, drug interactions, or alternative therapies.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00BFA6]">
                  Open Chat Console <ChevronRight size={12} />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function EHRPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA6]" /></div>}>
      <EHRContent />
    </Suspense>
  );
}
