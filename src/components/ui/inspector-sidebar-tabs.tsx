"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ListOrdered, 
  UserCheck, 
  Users, 
  ChevronRight, 
  User, 
  MapPin, 
  Eye, 
  Award,
  RotateCcw
} from 'lucide-react';
import { InputField } from './input-field';
import { SelectField } from './select-field';
import { 
  SectionId, 
  DEFAULT_SECTION_ORDER, 
  getSectionsInOrder 
} from './section-titles-card';

export type SidebarTabId = 'sections' | 'client' | 'team';

interface InspectorSidebarTabsProps {
  activeTab?: SidebarTabId;
  onTabChange?: (tab: SidebarTabId) => void;
  sectionOrder?: SectionId[];
  onSectionOrderChange?: (newOrder: SectionId[]) => void;
  report: {
    clientDetails: {
      name: string;
      countryCode: string;
      whatsappNumber: string;
      email: string;
      vehicleDetails: string;
      location: string;
    };
    teamDetails: {
      inspector: string;
    };
  };
  onUpdateClientDetails: (details: any) => void;
  onUpdateTeamDetails: (details: any) => void;
  countryCodeOptions: Array<{ value: string; label: string }>;
  locationOptions: Array<{ value: string; label: string }>;
  inspectorOptions: Array<{ value: string; label: string }>;
}

export const InspectorSidebarTabs: React.FC<InspectorSidebarTabsProps> = ({
  activeTab: controlledTab,
  onTabChange,
  sectionOrder = DEFAULT_SECTION_ORDER,
  onSectionOrderChange,
  report,
  onUpdateClientDetails,
  onUpdateTeamDetails,
  countryCodeOptions,
  locationOptions,
  inspectorOptions,
}) => {
  const [internalTab, setInternalTab] = useState<SidebarTabId>('sections');
  const [activeSectionId, setActiveSectionId] = useState<string>('section-inspection-details');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleTabChange = (tab: SidebarTabId) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const orderedSections = getSectionsInOrder(sectionOrder);
  const isCustomOrder = JSON.stringify(sectionOrder) !== JSON.stringify(DEFAULT_SECTION_ORDER);

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sectionOrder.length || fromIndex === toIndex) return;
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    if (onSectionOrderChange) {
      onSectionOrderChange(newOrder);
    }
  };

  const handleResetOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSectionOrderChange) {
      onSectionOrderChange(DEFAULT_SECTION_ORDER);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('ring-2', 'ring-[#9723FF]', 'ring-offset-2', 'transition-all', 'duration-300');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#9723FF]', 'ring-offset-2');
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 flex flex-col shrink-0 overflow-hidden">
      {/* 1. Sleek Segmented Tab Control */}
      <div className="px-2.5 py-2 border-b border-slate-100 bg-[#FAF9FD]/70">
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#ECEEF2] rounded-xl">
          {/* Tab 1: Sections */}
          <button
            type="button"
            onClick={() => handleTabChange('sections')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              currentTab === 'sections'
                ? 'bg-white text-[#1E1035] shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered size={12} className={currentTab === 'sections' ? 'text-[#9723FF]' : ''} />
            <span>Sections</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
              currentTab === 'sections' ? 'bg-[#9723FF]/10 text-[#9723FF]' : 'bg-slate-200/80 text-slate-500'
            }`}>
              {orderedSections.length}
            </span>
          </button>

          {/* Tab 2: Client */}
          <button
            type="button"
            onClick={() => handleTabChange('client')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              currentTab === 'client'
                ? 'bg-white text-[#1E1035] shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck size={12} className={currentTab === 'client' ? 'text-[#9723FF]' : ''} />
            <span>Client</span>
          </button>

          {/* Tab 3: Team */}
          <button
            type="button"
            onClick={() => handleTabChange('team')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              currentTab === 'team'
                ? 'bg-white text-[#1E1035] shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={12} className={currentTab === 'team' ? 'text-[#9723FF]' : ''} />
            <span>Team</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Content Panels */}
      <div className="p-1.5 sm:p-2">
        <AnimatePresence mode="wait">
          {/* TAB 1: SECTIONS */}
          {currentTab === 'sections' && (
            <motion.div
              key="tab-sections"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-1"
            >
              {isCustomOrder && (
                <div className="flex items-center justify-between pb-1 px-1.5">
                  <span className="text-[10.5px] text-slate-400">Custom order active</span>
                  <button
                    type="button"
                    onClick={handleResetOrder}
                    className="text-[10.5px] font-bold text-[#9723FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={10} />
                    Reset to default
                  </button>
                </div>
              )}

              {/* Clean Section List with Native Drag & Drop */}
              <div className="flex flex-col gap-1 max-h-[620px] overflow-y-auto custom-scrollbar">
                {orderedSections.map((sec, index) => {
                  const isActive = activeSectionId === sec.id;
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(index));
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedIndex(index);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          moveSection(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full group text-left flex items-center justify-between py-1.5 px-2 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                        isDragging ? 'opacity-40 scale-[0.98] border-dashed border-2 border-[#9723FF]' : ''
                      } ${
                        isDragOver ? 'border-t-2 border-[#9723FF] bg-[#FAF9FD]' : ''
                      } ${
                        isActive && !isDragging
                          ? 'bg-[#FAF5FF] border border-[#D9A8FF] shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1.5 flex-1">
                        {/* Number Badge */}
                        <span className={`w-6 h-6 rounded-lg text-[10.5px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-[#9723FF] text-white shadow-2xs' : 'bg-[#F4F5F8] text-[#7A8291]'
                        }`}>
                          {sec.num}
                        </span>

                        {/* Titles */}
                        <div className="min-w-0 flex flex-col flex-1">
                          <span className={`text-[12.5px] font-bold tracking-tight truncate leading-snug transition-colors ${
                            isActive ? 'text-[#9723FF]' : 'text-[#1E1035]'
                          }`}>
                            {sec.title}
                          </span>
                          <span className={`text-[10.5px] truncate leading-tight ${
                            isActive ? 'text-[#9723FF]/70' : 'text-slate-400'
                          }`}>
                            {sec.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Right Badge & Chevron */}
                      <div className="flex items-center gap-1 shrink-0">
                        {sec.badgeText && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${sec.badgeColor}`}>
                            {sec.badgeText}
                          </span>
                        )}

                        <ChevronRight 
                          size={12} 
                          className={`transition-all ${
                            isActive ? 'text-[#9723FF]' : 'text-slate-300 group-hover:text-slate-500'
                          }`} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: CLIENT DETAILS */}
          {currentTab === 'client' && (
            <motion.div
              key="tab-client"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-4"
              id="section-client-details"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#1E1035] tracking-tight">Add Client Details</h3>
                  <p className="text-slate-400 text-[10px]">Client contact information & location</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#9723FF] border border-purple-200/60">
                  Client
                </span>
              </div>

              <InputField 
                label="Client Name" 
                placeholder="Enter Client Name" 
                icon={<User size={16} fill="currentColor" strokeWidth={0} />} 
                value={report.clientDetails.name}
                onChange={(e) => onUpdateClientDetails({ name: e.target.value })}
              />
              
              {/* WhatsApp Number with Country Code Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1E1035]">WhatsApp Number</label>
                <div className="relative flex items-center w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-3 focus-within:ring-2 focus-within:ring-[#1E1035]/20 transition-all">
                  <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200">
                    <select
                      value={report.clientDetails.countryCode}
                      onChange={(e) => onUpdateClientDetails({ countryCode: e.target.value })}
                      className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                      {countryCodeOptions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="54 409 3009" 
                    value={report.clientDetails.whatsappNumber}
                    onChange={(e) => onUpdateClientDetails({ whatsappNumber: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent text-sm text-[#190933] placeholder-slate-400 pl-2 focus:outline-none" 
                  />
                </div>
              </div>
              
              <InputField 
                label="Email Address" 
                placeholder="client@example.com" 
                type="email"
                icon={<Eye size={16} fill="currentColor" strokeWidth={0} />} 
                value={report.clientDetails.email}
                onChange={(e) => onUpdateClientDetails({ email: e.target.value })}
              />

              <InputField 
                label="Vehicle Details" 
                placeholder="2025 Toyota Tundra TRD Pro" 
                value={report.clientDetails.vehicleDetails}
                onChange={(e) => onUpdateClientDetails({ vehicleDetails: e.target.value })}
              />

              <SelectField 
                label="Location" 
                placeholder="Select Location" 
                options={locationOptions}
                icon={<MapPin size={16} fill="currentColor" strokeWidth={0} />} 
                value={report.clientDetails.location}
                onChange={(e) => onUpdateClientDetails({ location: e.target.value })}
              />
            </motion.div>
          )}

          {/* TAB 3: OUR TEAM */}
          {currentTab === 'team' && (
            <motion.div
              key="tab-team"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-4"
              id="section-team-details"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#1E1035] tracking-tight">Our Team</h3>
                  <p className="text-slate-400 text-[10px]">Details related to our inspection team</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008751] border border-emerald-200/60">
                  Assigned
                </span>
              </div>

              <SelectField 
                label="Inspector" 
                placeholder="Select Inspector" 
                options={inspectorOptions}
                icon={<User size={16} />} 
                value={report.teamDetails.inspector}
                onChange={(e) => onUpdateTeamDetails({ inspector: e.target.value })}
              />

              {/* Inspector Verification Card */}
              <div className="bg-[#FAF9FD] rounded-2xl p-4 border border-purple-100/60 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#9723FF]/10 text-[#9723FF] flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1E1035] block leading-tight">
                      {report.teamDetails.inspector || "Ahmed Al Mansoori"}
                    </span>
                    <span className="text-[10px] text-slate-500">Lead QA Inspector • Level 3</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-100">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Hub Station</span>
                    <span className="font-bold text-slate-700">Dubai Al Quoz</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active On Duty
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
