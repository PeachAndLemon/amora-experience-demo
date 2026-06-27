import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { DeepOnboardingAnswers, UserProfile } from '@/types/amora';

interface Profile {
  id: string;
  user_id: string;
  partner1_name: string;
  partner2_name: string;
  couple_name: string;
  relationship_season: string | null;
  relationship_duration: string | null;
  start_date: string;
  partner_code: string;
  partner_id: string | null;
  partner_connected: boolean;
  created_at: string;
  updated_at: string;
}

interface OnboardingAnswers {
  id: string;
  user_id: string;
  autopilot_level: number;
  rich_in: string | null;
  rich_in_other: string | null;
  want_more_of: string[];
  gets_in_way: string[];
  love_as_place: string;
  destination_feeling: string | null;
  amora_wish: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOnboardingAnswers();
    } else {
      setProfile(null);
      setOnboardingAnswers(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, partner1_name, partner2_name, couple_name, relationship_season, relationship_duration, start_date, partner_id, partner_connected, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      // Fetch own partner_code via SECURITY DEFINER RPC (column-level read is revoked
      // so a linked partner cannot see the other user's invite code).
      const { data: codeData } = await supabase.rpc('get_my_partner_code' as any);
      setProfile({ ...(data as any), partner_code: (codeData as unknown as string) || '' });
    }
    setLoading(false);
  };

  const fetchOnboardingAnswers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('onboarding_answers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setOnboardingAnswers(data);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        partner1_name: updates.partner1Name,
        partner2_name: updates.partner2Name,
        couple_name: updates.coupleName,
        relationship_season: updates.relationshipSeason,
        relationship_duration: updates.relationshipDuration,
      })
      .eq('user_id', user.id);

    if (!error) {
      await fetchProfile();
    }

    return { error };
  };

  const saveOnboardingAnswers = async (answers: DeepOnboardingAnswers) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('onboarding_answers')
      .upsert({
        user_id: user.id,
        autopilot_level: answers.autopilotLevel,
        rich_in: answers.richIn,
        rich_in_other: answers.richInOther || null,
        want_more_of: answers.wantMoreOf,
        gets_in_way: answers.getsInWay,
        love_as_place: answers.loveAsPlace,
        destination_feeling: answers.destinationFeeling,
        amora_wish: answers.amoraWish,
      });

    if (!error) {
      await fetchOnboardingAnswers();
    }

    return { error };
  };

  const linkPartner = async (partnerCode: string) => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    const { data, error } = await supabase.rpc('link_partner', {
      partner_code_input: partnerCode,
    });

    if (!error && data) {
      await fetchProfile();
      return { success: true, error: null };
    }

    return { success: false, error: error || new Error('Invalid partner code') };
  };

  const getPartnerCode = () => profile?.partner_code || null;

  return {
    profile,
    onboardingAnswers,
    loading,
    updateProfile,
    saveOnboardingAnswers,
    linkPartner,
    getPartnerCode,
    refetch: fetchProfile,
  };
}
