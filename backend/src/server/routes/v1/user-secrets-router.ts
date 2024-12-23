import { z } from "zod";

import { UserSecretsSchema } from "@app/db/schemas";
import { readLimit, userSecretCreationLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";
import { TCredentialTypes, TCreditCardSecret, TWebLoginSecret } from "@app/services/user-secrets/user-secrets-types";

export const registerUserSecretsRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      querystring: z.object({
        offset: z.coerce.number().min(0).max(100).default(0),
        limit: z.coerce.number().min(1).max(100).default(25)
      }),
      response: {
        200: z.object({
          secrets: z.array(UserSecretsSchema),
          totalCount: z.number()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { secrets, totalCount } = await req.server.services.userSecrets.getUserSecrets({
        actor: req.permission.type,
        actorId: req.permission.id,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        ...req.query
      });

      return {
        secrets,
        totalCount
      };
    }
  });

  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: userSecretCreationLimit
    },
    schema: {
      body: z.object({
        name: z.string(),
        credentialType: z.nativeEnum(TCredentialTypes).default(TCredentialTypes.WebLoginSecret),
        secretData: z.custom<TCreditCardSecret | TWebLoginSecret>(),
        metadata: z.custom<Record<string, string>>()
      }),
      response: {
        200: z.object({
          id: z.string()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const sharedSecret = await req.server.services.userSecrets.createUserSecret({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        ...req.body
      });
      return { id: sharedSecret.id };
    }
  });

  server.route({
    method: "GET",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        userSecretId: z.string()
      }),
      response: {
        200: UserSecretsSchema
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { userSecretId } = req.params;
      const userSecret = await req.server.services.userSecrets.getUserSecretById({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        userSecretId
      });

      return { ...userSecret };
    }
  });

  server.route({
    method: "PUT",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      body: z.object({
        name: z.string(),
        credentialType: z.nativeEnum(TCredentialTypes).default(TCredentialTypes.WebLoginSecret),
        secretData: z.custom<TCreditCardSecret | TWebLoginSecret>(),
        metadata: z.custom<Record<string, string>>()
      }),
      params: z.object({
        userSecretId: z.string()
      }),
      response: {
        200: UserSecretsSchema
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { userSecretId } = req.params;
      const updatedUserSecret = await req.server.services.userSecrets.updateUserSecretById({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        userSecretId,
        ...req.body
      });

      return { ...updatedUserSecret };
    }
  });

  server.route({
    method: "DELETE",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        userSecretId: z.string()
      }),
      response: {
        200: UserSecretsSchema
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { userSecretId } = req.params;
      const deletedUserSecret = await req.server.services.userSecrets.deleteUserSecretById({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        userSecretId
      });

      return { ...deletedUserSecret };
    }
  });
};
