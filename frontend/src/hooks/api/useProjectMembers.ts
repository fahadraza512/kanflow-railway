import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/api/project.service';

export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectService.getMembers(projectId!),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role?: string }) =>
      projectService.addMember(projectId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectService.removeMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
