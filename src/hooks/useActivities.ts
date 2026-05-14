import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseAPI } from '../api/database';
import { useAuth } from '../contexts/AuthContext';
import { dbToFrontendActivity, frontendToDbActivity } from '../utils/activityTransform';
import { Activity } from '../types';

export const useActivities = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const raw = await databaseAPI.getUserActivities(user.id);
      return raw.map(dbToFrontendActivity);
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

export const useAddActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (partialActivity: Partial<Activity>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const activity: Activity = {
        ...partialActivity,
        id: Date.now().toString(), // temporary ID
        date: new Date().toISOString().split('T')[0],
      } as Activity;

      const saved = await databaseAPI.createActivity(frontendToDbActivity(activity, user.id));
      if (!saved) throw new Error('Failed to save activity');
      return dbToFrontendActivity(saved);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      await databaseAPI.deleteActivity(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
    },
  });
};
