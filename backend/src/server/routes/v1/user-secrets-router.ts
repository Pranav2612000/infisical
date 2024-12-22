import { z } from "zod";

import { userSecretCreationLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";
import { TCredentialTypes, TCreditCardSecret, TWebLoginSecret } from "@app/services/user-secrets/user-secrets-types";

export const registerUserSecretsRouter = async (server: FastifyZodProvider) => {
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
};
