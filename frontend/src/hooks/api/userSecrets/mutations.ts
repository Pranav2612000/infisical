import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { userSecretKeys } from "./queries";
import {
  TCreatedUserSecret,
  TCreateUserSecretRequest,
  TDeleteUserSecretRequest,
  TUpdateUserSecretRequest,
  TUserSecret
} from "./types";

export const useCreateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TCreateUserSecretRequest) => {
      const { data } = await apiRequest.post<TCreatedUserSecret>(
        "/api/v1/user-secrets",
        inputData
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

export const useUpdateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TUpdateUserSecretRequest) => {
      const { data } = await apiRequest.put<TCreatedUserSecret>(
        `/api/v1/user-secrets/${inputData.userSecretId}`,
        inputData
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

export const useDeleteUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation<TUserSecret, { message: string }, { userSecretId: string }>({
    mutationFn: async ({ userSecretId }: TDeleteUserSecretRequest) => {
      const { data } = await apiRequest.delete<TUserSecret>(
        `/api/v1/user-secrets/${userSecretId}`
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};
