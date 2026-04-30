'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  MapPin, 
  Stethoscope, 
  ChevronRight, 
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firestoreList } from '@/lib/firebase-rest';
import { Doctor } from '@/lib/types';
import { seedDoctors } from '@/lib/seed';
import { MOCK_DOCTORS } from '@/lib/seed-data';

export default function DiscoveryPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const loadDoctors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await firestoreList('doctors');
      if (list && list.length > 0) {
        setDoctors(list as any);
      } else {
        setDoctors(MOCK_DOCTORS); // show dummy doctors if Firestore is empty
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setDoctors(MOCK_DOCTORS); // show dummy doctors if Firestore fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDoctors();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDoctors]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDoctors();
      setSeedSuccess(true);
      await loadDoctors();
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      alert('Seeding failed. Check your Firebase config in firebase-applet-config.json');
    } finally {
      setIsSeeding(false);
    }
  };

  const specialties = Array.from(new Set(doctors.map(d => d.specialty)));

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-[#0A1628] mb-4 tracking-tight">
              Find the right <span className="text-[#00BFA6]">specialist</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl">
              Connect with India&apos;s top-rated doctors for instant video consultations and expert medical advice.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
            >
              {isSeeding ? 'Seeding...' : seedSuccess ? <><CheckCircle2 size={18} /> Success</> : <><Database size={18} /> Seed Demo Data</>}
            </button>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Database Initialization</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search doctors, specialties, or symptoms..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00BFA6] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="pl-12 pr-8 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00BFA6] outline-none appearance-none cursor-pointer font-medium"
                onChange={(e) => setSelectedSpecialty(e.target.value || null)}
              >
                <option value="">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Specialty Quick Links */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {specialties.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(selectedSpecialty === s ? null : s)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                selectedSpecialty === s 
                ? 'bg-[#00BFA6] text-white border-[#00BFA6] shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#00BFA6]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-80">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl mb-4" />
              <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          ))
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={doc.id}
              className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#00BFA6] hover:shadow-2xl hover:shadow-[#00BFA6]/5 transition-all cursor-pointer"
            >
              <Link href={`/doctor/${doc.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded-md text-[10px] font-black">
                        <Star size={10} fill="currentColor" />
                        {doc.rating}
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {doc.availabilityStatus}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-[#0A1628] group-hover:text-[#00BFA6] transition-colors mb-1 truncate">{doc.name}</h3>
                <p className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
                  <Stethoscope size={14} />
                  {doc.specialty}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mb-6">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {doc.location.split(' ')[0]}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{doc.experience} exp.</span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-[#00BFA6]/10">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Consultation Fee</p>
                    <p className="text-lg font-bold text-[#0A1628]">₹{(doc.consultationFee || 0).toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 group-hover:bg-[#00BFA6] group-hover:text-white rounded-xl flex items-center justify-center text-gray-400 transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#0A1628] mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
