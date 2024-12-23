import { TPermissionServiceFactory } from "@app/ee/services/permission/permission-service";
import { ForbiddenRequestError, NotFoundError } from "@app/lib/errors";

import { TKmsServiceFactory } from "../kms/kms-service";
import { TUserSecretsDALFactory } from "./user-secrets-dal";
import {
  TCreateUserSecretDTO,
  TDeleteUserSecretDTO,
  TGetUserSecretByIdDTO,
  TGetUserSecretsDTO,
  TUpdateUserSecretDTO
} from "./user-secrets-types";

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
    if (!actorOrgId) throw new ForbiddenRequestError();
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

  const updateUserSecretById = async ({
    actor,
    actorId,
    orgId,
    actorAuthMethod,
    actorOrgId,
    userSecretId,
    name,
    credentialType,
    secretData,
    metadata
  }: TUpdateUserSecretDTO) => {
    if (!actorOrgId) throw new ForbiddenRequestError();

    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new ForbiddenRequestError({ name: "User is not a part of the specified organization" });

    const encryptWithRoot = kmsService.encryptWithRootKey();

    const encryptedSecretData: Record<string, string> = {};

    Object.entries(secretData).forEach(([key, value]) => {
      encryptedSecretData[key] = encryptWithRoot(Buffer.from(value)).toString("hex");
    });

    const newUserSecret = await userSecretsDAL.updateById(userSecretId, {
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

    return newUserSecret;
  };

  const getUserSecrets = async ({ actor, actorId, actorAuthMethod, actorOrgId, offset, limit }: TGetUserSecretsDTO) => {
    if (!actorOrgId) throw new ForbiddenRequestError();

    const { permission } = await permissionService.getOrgPermission(
      actor,
      actorId,
      actorOrgId,
      actorAuthMethod,
      actorOrgId
    );
    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });

    const secrets = await userSecretsDAL.find(
      {
        userId: actorId,
        orgId: actorOrgId
      },
      { offset, limit, sort: [["createdAt", "asc"]] }
    );

    const count = await userSecretsDAL.countAllUserOrgUserSecrets({
      orgId: actorOrgId,
      userId: actorId
    });

    return {
      secrets,
      totalCount: count
    };
  };

  const getUserSecretById = async ({
    actor,
    actorId,
    actorAuthMethod,
    actorOrgId,
    userSecretId
  }: TGetUserSecretByIdDTO) => {
    if (!actorOrgId) throw new ForbiddenRequestError();
    const { permission } = await permissionService.getOrgPermission(
      actor,
      actorId,
      actorOrgId,
      actorAuthMethod,
      actorOrgId
    );

    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });
    const userSecret = await userSecretsDAL.findOne({
      id: userSecretId
    });

    if (!userSecret)
      throw new NotFoundError({
        message: `User secret with ID '${userSecretId}' not found`
      });

    const decryptWithRoot = kmsService.decryptWithRootKey();
    const decryptedSecretData: Record<string, string> = {};

    Object.entries(userSecret.secretData as Record<string, string>).forEach(([key, value]) => {
      decryptedSecretData[key] = decryptWithRoot(Buffer.from(value, "hex")).toString();
    });

    return {
      ...userSecret,
      secretData: decryptedSecretData
    };
  };

  const deleteUserSecretById = async (deleteUserSecretInput: TDeleteUserSecretDTO) => {
    const { actor, actorId, orgId, actorAuthMethod, actorOrgId, userSecretId } = deleteUserSecretInput;
    if (!actorOrgId) throw new ForbiddenRequestError();
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });

    const userSecret = await userSecretsDAL.findById(userSecretId);

    if (!userSecret) {
      throw new NotFoundError({
        message: `User secret with ID '${userSecretId}' not found`
      });
    }

    if (userSecret.orgId && userSecret.orgId !== orgId)
      throw new ForbiddenRequestError({ message: "User does not have permission to delete user secret" });

    const deletedUserSecret = await userSecretsDAL.deleteById(userSecretId);

    return deletedUserSecret;
  };

  return {
    createUserSecret,
    getUserSecrets,
    getUserSecretById,
    updateUserSecretById,
    deleteUserSecretById
  };
};
