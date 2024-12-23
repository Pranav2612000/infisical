import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { TUserSecret, TViewUserSecretResponse } from "./types";

export const userSecretKeys = {
  allUserSecrets: () => ["userSecrets"] as const,
  specificUserSecrets: ({ offset, limit }: { offset: number; limit: number }) =>
    [...userSecretKeys.allUserSecrets(), { offset, limit }] as const,
  getUserSecretById: (arg: { id: string; }) => [
    "user-secrets",
    arg
  ]
};

export const useGetUserSecrets = ({
  offset = 0,
  limit = 25
}: {
  offset: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: userSecretKeys.specificUserSecrets({ offset, limit }),
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit)
      });

      const { data } = await apiRequest.get<{ secrets: TUserSecret[]; totalCount: number }>(
        "/api/v1/user-secrets/",
        {
          params
        }
      );
      return data;
    }
  });
};

export const useGetUserSecretById = ({
  userSecretId,
  enabled
}: {
  userSecretId: string;
  enabled: boolean;
}) => {
  return useQuery<TViewUserSecretResponse>(
    userSecretKeys.getUserSecretById({ id: userSecretId }),
    async () => {
      const { data } = await apiRequest.get<TViewUserSecretResponse>(
        `/api/v1/user-secrets/${userSecretId}`);

      return data;
    },
    {
      enabled: enabled && Boolean(userSecretId)
    }
  );
};
