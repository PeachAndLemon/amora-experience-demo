import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PartnerLinkRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export function usePartnerRequests() {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<PartnerLinkRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PartnerLinkRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await (supabase
      .from as any)('partner_link_requests')
      .select('*')
      .eq('status', 'pending')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (data) {
      const incoming: PartnerLinkRequest[] = [];
      const outgoing: PartnerLinkRequest[] = [];

      for (const req of data as PartnerLinkRequest[]) {
        // Fetch names for display
        if (req.sender_id !== user.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('partner1_name')
            .eq('user_id', req.sender_id)
            .maybeSingle();
          req.sender_name = profile?.partner1_name || 'Someone';
          incoming.push(req);
        } else {
          const { data: profile } = await supabase
            .from('profiles')
            .select('partner1_name')
            .eq('user_id', req.receiver_id)
            .maybeSingle();
          req.receiver_name = profile?.partner1_name || 'Someone';
          outgoing.push(req);
        }
      }

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('partner_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_link_requests',
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchRequests]);

  const sendRequest = async (partnerCode: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.rpc('link_partner', {
      partner_code_input: partnerCode.trim().toLowerCase(),
    });

    if (error || !data) {
      return { success: false, error: 'Invalid code, already pending, or partner already connected.' };
    }

    await fetchRequests();
    return { success: true };
  };

  const acceptRequest = async (requestId: string): Promise<boolean> => {
    const { data, error } = await (supabase.rpc as any)('accept_partner_link', {
      request_id: requestId,
    });

    if (!error && data) {
      await fetchRequests();
      return true;
    }
    return false;
  };

  const rejectRequest = async (requestId: string): Promise<boolean> => {
    const { data, error } = await (supabase.rpc as any)('reject_partner_link', {
      request_id: requestId,
    });

    if (!error && data) {
      await fetchRequests();
      return true;
    }
    return false;
  };

  const unlinkPartner = async (): Promise<boolean> => {
    const { data, error } = await (supabase.rpc as any)('unlink_partner');
    if (!error && data) {
      return true;
    }
    return false;
  };

  const hasPendingIncoming = incomingRequests.length > 0;
  const hasPendingOutgoing = outgoingRequests.length > 0;

  return {
    incomingRequests,
    outgoingRequests,
    hasPendingIncoming,
    hasPendingOutgoing,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    unlinkPartner,
    refetch: fetchRequests,
  };
}
