import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Milestone, Stamp, Activity, Reward, PassportData } from '@/types/amora';
import { milestones as baseMilestones, stamps as baseStamps, activities as baseActivities, rewards as baseRewards } from '@/data/mockData';
import { mockEvents } from '@/data/eventData';

interface DemoModeData {
  passportData: PassportData;
  stamps: Stamp[];
  milestones: Milestone[];
  activities: Activity[];
  rewards: Reward[];
  completedActivityIds: string[];
  checkedInEventIds: string[];
  earnedStampIds: string[];
}

interface DemoModeContextType {
  isDemoActive: boolean;
  demoData: DemoModeData | null;
  activateDemo: () => boolean; // returns false if not admin
  deactivateDemo: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

function generateDemoData(): DemoModeData {
  // Randomize which stamps are earned (5-7 out of 8)
  const earnCount = 5 + Math.floor(Math.random() * 3);
  const shuffledStamps = [...baseStamps].sort(() => Math.random() - 0.5);
  const earnedIds = shuffledStamps.slice(0, earnCount).map(s => s.id);

  const demoStamps: Stamp[] = baseStamps.map(s => ({
    ...s,
    isEarned: earnedIds.includes(s.id),
    earnedAt: earnedIds.includes(s.id)
      ? new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000)
      : undefined,
  }));

  // Milestone progress based on earned stamps
  const demoMilestones: Milestone[] = baseMilestones.map(m => {
    const milestoneStamps = demoStamps.filter(s => s.milestoneId === m.id && s.isEarned).length;
    const totalStamps = demoStamps.filter(s => s.milestoneId === m.id).length;
    const completedActivities = Math.min(
      m.totalActivities,
      Math.floor(m.totalActivities * (0.3 + Math.random() * 0.6))
    );
    const progress = m.totalActivities > 0
      ? Math.round((completedActivities / m.totalActivities) * 100)
      : 0;
    return { ...m, progress, completedActivities, isUnlocked: true };
  });

  // Mark random activities as completed (60-80%)
  const completionRate = 0.6 + Math.random() * 0.2;
  const completedActivityIds = baseActivities
    .filter(() => Math.random() < completionRate)
    .map(a => a.id);

  const demoActivities: Activity[] = baseActivities.map(a => ({
    ...a,
    isCompleted: completedActivityIds.includes(a.id),
  }));

  // Mark 2-4 events as checked in
  const eventCheckCount = 2 + Math.floor(Math.random() * 3);
  const checkedInEventIds = mockEvents
    .sort(() => Math.random() - 0.5)
    .slice(0, eventCheckCount)
    .map(e => e.id);

  // Unlock most rewards
  const demoRewards: Reward[] = baseRewards.map((r, i) => ({
    ...r,
    isUnlocked: i < 3 || Math.random() > 0.4,
    unlockedAt: i < 3
      ? new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000)
      : Math.random() > 0.4
        ? new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000)
        : undefined,
  }));

  // Level based on earned stamps
  const level = Math.min(5, 1 + Math.floor(earnedIds.length / 2));

  const passportData: PassportData = {
    level,
    totalStamps: baseStamps.length,
    earnedStamps: earnedIds.length,
    coupleName: 'Alex & Jordan',
    startDate: new Date(Date.now() - 120 * 86400000), // ~4 months ago
    milestones: demoMilestones,
    stamps: demoStamps,
  };

  return {
    passportData,
    stamps: demoStamps,
    milestones: demoMilestones,
    activities: demoActivities,
    rewards: demoRewards,
    completedActivityIds,
    checkedInEventIds,
    earnedStampIds: earnedIds,
  };
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoData, setDemoData] = useState<DemoModeData | null>(null);

  const activateDemo = () => {
    const data = generateDemoData();
    setDemoData(data);
    setIsDemoActive(true);
    return true;
  };

  const deactivateDemo = () => {
    setIsDemoActive(false);
    setDemoData(null);
  };

  return (
    <DemoModeContext.Provider value={{ isDemoActive, demoData, activateDemo, deactivateDemo }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
