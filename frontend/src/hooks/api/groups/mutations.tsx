import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { organizationKeys } from "../organization/queries";
import { TGroup } from "./types";

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ 
            name,
            slug,
            organizationId,
            role
        }: { 
            name: string;
            slug: string;
            organizationId: string;
            role?: string;
        }) => {
                const {
                    data: group
                } = await apiRequest.post<TGroup>("/api/v1/groups", {
                    name,
                    slug,
                    organizationId,
                    role
                });
        
                return group;
        },
        onSuccess: (_, { organizationId }) => {
            queryClient.invalidateQueries(organizationKeys.getOrgGroups(organizationId));
        }
    });
};

export const useUpdateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ 
            currentSlug,
            name,
            slug,
            role
        }: { 
            currentSlug: string;
            name?: string;
            slug?: string;
            role?: string;
        }) => {
            const {
                data: group
            } = await apiRequest.patch<TGroup>(`/api/v1/groups/${currentSlug}`, {
                name,
                slug,
                role
            });
            
            return group;
        },
        onSuccess: ({ orgId }) => {
            queryClient.invalidateQueries(organizationKeys.getOrgGroups(orgId));
        }
    });
};

export const useDeleteGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ 
            slug
        }: { 
            slug: string;
        }) => {
            const {
                data: group
            } = await apiRequest.delete<TGroup>(`/api/v1/groups/${slug}`);

            return group;
        },
        onSuccess: ({ orgId }) => {
            queryClient.invalidateQueries(organizationKeys.getOrgGroups(orgId));
        }
    });
};