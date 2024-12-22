import { TPermissionServiceFactory } from "@app/ee/services/permission/permission-service";
import { ForbiddenRequestError } from "@app/lib/errors";

import { TKmsServiceFactory } from "../kms/kms-service";
import { TUserSecretsDALFactory } from "./user-secrets-dal";
import { TCreateUserSecretDTO } from "./user-secrets-types";

type TUserSecretsServiceFactoryDep = {
  permissionService: Pick<TPermissionServiceFactory, "getOrgPermission">;
  userSecretsDAL: TUserSecretsDALFactory;
  kmsService: TKmsServiceFactory;
};

export type TUserSecretsServiceFactory = ReturnType<typeof userSecretsServiceFactory>;

export const userSecretsServiceFactory = ({
  permissionService,
  userSecretsDAL,
  kmsService
}: TUserSecretsServiceFactoryDep) => {
  const createUserSecret = async ({
    actor,
    actorId,
    orgId,
    actorAuthMethod,
    actorOrgId,
    name,
    credentialType,
    secretData,
    metadata
  }: TCreateUserSecretDTO) => {
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new ForbiddenRequestError({ name: "User is not a part of the specified organization" });

    const encryptWithRoot = kmsService.encryptWithRootKey();

    const encryptedSecretData: Record<string, string> = {};

    Object.entries(secretData).forEach(([key, value]) => {
      encryptedSecretData[key] = encryptWithRoot(Buffer.from(value)).toString("hex");
    });

    const newUserSecret = await userSecretsDAL.create({
      iv: null,
      tag: null,
      credentialType,
      encryptedValue: null,
      secretData: encryptedSecretData,
      name,
      userId: actorId,
      orgId,
      metadata
    });

    return { id: newUserSecret.id };
  };

  return {
    createUserSecret
  };
};
