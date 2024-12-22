import { TGenericPermission } from "@app/lib/types";

import { ActorAuthMethod, ActorType } from "../auth/auth-type";
import { TSharedSecretPermission } from "../secret-sharing/secret-sharing-types";

export enum TCredentialTypes {
  WebLoginSecret = "WebLoginSecret",
  CreditCardSecret = "CreditCardSecret",
  SecureNoteSecret = "SecureNoteSecret"
}

export type TWebLoginSecret = {
  username: string;
  password: string;
};

export type TCreditCardSecret = {
  cardNumber: string;
  expiryDate: Date;
  CVV: string;
};

export type TSecretNoteSecret = {
  title: string;
  content: string;
};

export type TSecretData = TWebLoginSecret | TCreditCardSecret | TSecretNoteSecret;

export type TGetUserSecretsDTO = {
  offset: number;
  limit: number;
} & TGenericPermission;

export type TUserSecretPermission = {
  actor: ActorType;
  actorId: string;
  actorAuthMethod: ActorAuthMethod;
  actorOrgId: string;
  orgId: string;
};

export type TCreateUserSecretDTO = {
  name: string;
  credentialType: TCredentialTypes;
  secretData: TSecretData;
  metadata: Record<string, string>;
} & TSharedSecretPermission;

export type TUpdateUserSecretDTO = {
  userSecretId: string;
  name: string;
  credentialType: TCredentialTypes;
  secretData: TSecretData;
  metadata: Record<string, string>;
} & TSharedSecretPermission;

export type TGetUserSecretByIdDTO = {
  userSecretId: string;
} & TUserSecretPermission;

export type TValidateUserSecretDTO = TGetUserSecretByIdDTO;

export type TDeleteUserSecretDTO = {
  userSecretId: string;
} & TUserSecretPermission;
