import { z } from "zod";

import { TCredentialTypes } from "@app/hooks/api/userSecrets";

export const supportedSecretTypesContentMap: Record<TCredentialTypes, string> = {
  "WebLoginSecret": "Web Secret",
  "CreditCardSecret": "Credit Card",
  "SecureNoteSecret": "Secure Note"
};

export const supportedSecretTypes = {
  "WebLoginSecret": [
    {
      "name": "username",
      "type": "text",
      "placeholder": "Username",
      "label": "Username",
      "validator": z.string().min(1)
    },
    {
      "name": "password",
      "type": "text",
      "placeholder": "Password",
      "label": "Password",
      "validator": z.string().min(1)
    }
  ],
  "CreditCardSecret": [
    {
      "name": "cardNumber",
      "type": "tel",
      "placeholder": "Enter cardnumber without spaces",
      "label": "Card Number",
      "maxLength": 19,
      "validator": z.string().length(16).regex(/^[0-9]*$/, { message: "Only numbers allowed"})
    },
    {
      "name": "expiryDate",
      "type": "date",
      "placeholder": "Expiry Date",
      "label": "Expiry Date",
      "validator": z.string().min(1)
    },
    {
      "name": "cvv",
      "type": "tel",
      "placeholder": "Usually present behind your card",
      "label": "CVV",
      "maxLength": 3,
      "validator": z.string().length(3).regex(/^[0-9]*$/, { message: "Only numbers allowed"})
    }
  ],
  "SecureNoteSecret": [
    {
      "name": "title",
      "type": "text",
      "placeholder": "Title",
      "label": "Title",
      "validator": z.string().min(1)
    },
    {
      "name": "content",
      "type": "Content",
      "placeholder": "Content",
      "label": "Content",
      "validator": z.string().min(1)
    }
  ]
};

type Keys = keyof typeof supportedSecretTypes;
type Values = typeof supportedSecretTypes[Keys];

// Returns an object of zod types for a secret type
// e.g for CreditCardSecret the function would return
// {
//    "cardNumber": z.string().min(1).regex(/^[0-9]*$/, { message: "Only numbers allowed"})
//    "expiryDate": z.string().min(1)
//    "cvv": z.string().length(3).regex(/^[0-9]*$/, { message: "Only numbers allowed"})
// }
const getZodTypesForSecretType = (secretTypeData: Values) => {
  return secretTypeData.reduce((acc, entry) => {
    acc[entry.name] = entry.validator;

    return acc;
  }, {} as Record<string, z.ZodSchema>);
}

// Returns an array of zod types for all secret types, to be used with zod.union
export const secretDataZodType = z.union(Object.values(supportedSecretTypes)
  .map(secretTypeData => {
    return z.object(getZodTypesForSecretType(secretTypeData)) as z.ZodTypeAny;
  }) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);

export const userSecretSchema = z.object({
  name: z.string().min(1),
  credentialType: z.nativeEnum(TCredentialTypes),
  secretData: secretDataZodType
});
