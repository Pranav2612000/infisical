import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, Select, SelectItem } from "@app/components/v2";
import { TCredentialTypes, TSecretData, useCreateUserSecret } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { supportedSecretTypes, supportedSecretTypesContentMap, userSecretSchema } from "../supportedSecretTypes";

export type FormData = z.infer<typeof userSecretSchema>;
type Props = {
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["createUserSecret"]>,
    state?: boolean
  ) => void;
};

export const AddUserSecretForm = ({ handlePopUpClose }: Props) => {
  const createUserSecret = useCreateUserSecret();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(userSecretSchema),
    defaultValues: {
      credentialType: TCredentialTypes.WebLoginSecret,
    }
  });
  const credentialTypeVal = watch("credentialType");

  const onFormSubmit = async ({
    name,
    credentialType,
    secretData
  }: FormData) => {
    const supportedKeys = supportedSecretTypes[credentialType].map(entry => entry.name);
    const parsedSecretData = Object.keys(secretData)
      .filter(key => supportedKeys.includes(key))
      .reduce((acc: any, curr) => {
        acc[curr as keyof TSecretData] = secretData[curr as keyof TSecretData];

        return acc;
      }, {} as TSecretData);

    try {
      await createUserSecret.mutateAsync({
        name,
        credentialType,
        secretData: parsedSecretData,
        metadata: {}
      });

      createNotification({
        text: "Secret created successfully",
        type: "success"
      });
      handlePopUpClose("createUserSecret");
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create the secret.",
        type: "error"
      });
    }
  };


  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label="Name"
            isError={Boolean(error)}
            errorText={error?.message}
          >
            <Input {...field} placeholder="Secret nickname" type="text" />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="credentialType"
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl
            label="Type"
            isError={Boolean(error)}
            errorText={error?.message}
          >
            <Select
              defaultValue={field.value}
              {...field}
              onValueChange={(e) => onChange(e)}
              className="w-full"
            >
              {Object.entries(supportedSecretTypesContentMap).map(([secretType, content]) => {
                return <SelectItem key={`secret-${secretType}`} value={secretType}>{content}</SelectItem>;
              })}
            </Select>
          </FormControl>
        )}
      />
      {
        supportedSecretTypes[credentialTypeVal].map(({
          name,
          label,
          placeholder,
          type,
          ...credentialTypeValFields
        }) => {
          return (
            <Controller
                key={name}
                control={control}
                name={`secretData.${name}`}
                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                  <FormControl
                    label={label}
                    isError={Boolean(error)}
                    errorText={error?.message}
                  >
                    <Input
                      {...field}
                      {...credentialTypeValFields}
                      onChange={(e) => onChange(e.target.value)}
                      value={value?.toString()}
                      placeholder={placeholder}
                      type={type}
                    />
                  </FormControl>
                )}
              />
          );
        })
      }
      
      <Button
        className="mt-4"
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        Create Secret
      </Button>
    </form>
  )
};
