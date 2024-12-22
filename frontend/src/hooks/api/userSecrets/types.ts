export type TUserSecret = {
  id: string;
  userId: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  credentialType: TCredentialTypes,
  secretData: TWebLoginSecret | TCreditCardSecret,
  metadata: Record<string, string>,
  encryptedValue: string;
  iv: string;
  tag: string;
};

export enum TCredentialTypes {
  WebLoginSecret = "WebLoginSecret",
  CreditCardSecret = "CreditCardSecret",
  SecureNoteSecret = "SecureNoteSecret"
}

export type TWebLoginSecret = {
  username: string,
  password: string
}

export type TCreditCardSecret = {
  cardNumber: string,
  expiryDate: Date,
  CVV: string;
}

export type TSecretNoteSecret = {
  title: string,
  content: string
}

export type TSecretData = TWebLoginSecret | TCreditCardSecret | TSecretNoteSecret;

export type TCreatedUserSecret = {
  id: string;
};

export type TCreateUserSecretRequest = {
  name?: string;
  credentialType: TCredentialTypes,
  secretData: TWebLoginSecret | TCreditCardSecret,
  metadata: Record<string, string>
};

export type TUpdateUserSecretRequest = {
  userSecretId?: string;
  name?: string;
  credentialType: TCredentialTypes,
  secretData: TWebLoginSecret | TCreditCardSecret,
  metadata: Record<string, string>
};

export type TViewUserSecretResponse = {
  id: string;
  userId: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  credentialType: TCredentialTypes,
  secretData: TWebLoginSecret | TCreditCardSecret,
  metadata: Record<string, string>,
};

export type TDeleteUserSecretRequest = {
  userSecretId: string;
};