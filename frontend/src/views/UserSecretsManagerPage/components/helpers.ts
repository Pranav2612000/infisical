import { TCredentialTypes } from "@app/hooks/api/userSecrets";

export const getContentForCredentialType = (credentialType:TCredentialTypes) => {
  if (credentialType === "CreditCardSecret") {
    return "Credit Card";
  }
  if (credentialType === "WebLoginSecret") {
    return "Web Secret";
  }

  return "";
};