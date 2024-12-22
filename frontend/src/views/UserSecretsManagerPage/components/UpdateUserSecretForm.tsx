import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, Select, SelectItem } from "@app/components/v2";
import { TCredentialTypes, TSecretData, TViewUserSecretResponse, useUpdateUserSecret } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import supportedSecretTypes from "../supportedSecretTypes";

const schema = z.object({
  name: z.string(),
  credentialType: z.nativeEnum(TCredentialTypes),
  secretData: z.custom<TSecretData>()
});


export type FormData = z.infer<typeof schema>;
type Props = {
  data: TViewUserSecretResponse | undefined;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["updateUserSecret"]>,
    state?: boolean
  ) => void;
};

export const UpdateUserSecretForm = ({ data, handlePopUpClose }: Props) => {
  const updateUserSecret = useUpdateUserSecret();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name || "",
      credentialType: data?.credentialType,
      secretData: data?.secretData
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
      .reduce((acc, curr) => {
        acc[curr as keyof TSecretData] = secretData[curr as keyof TSecretData];

        return acc;
      }, {} as TSecretData);

    try {
      await updateUserSecret.mutateAsync({
        userSecretId: data?.id,
        name,
        credentialType,
        secretData: parsedSecretData,
        metadata: {}
      });

      createNotification({
        text: "Secret updated successfully",
        type: "success"
      });
      handlePopUpClose("updateUserSecret");
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to update the secret.",
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
              <SelectItem value={TCredentialTypes.WebLoginSecret}>Web Secret</SelectItem>
              <SelectItem value={TCredentialTypes.CreditCardSecret}>
                Credit Card
              </SelectItem>
            </Select>
          </FormControl>
        )}
      />
      {
        supportedSecretTypes?.[credentialTypeVal]?.map((credentialTypeFieldConfig) => {
          return (
            <Controller
                key={credentialTypeFieldConfig.name}
                control={control}
                name="secretData"
                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                  <FormControl
                    label={credentialTypeFieldConfig.label}
                    isError={Boolean(error)}
                    errorText={error?.message}
                  >
                    <Input
                      {...field}
                      onChange={(e) => onChange({
                        ...value,
                        [credentialTypeFieldConfig.name]: e.target.value
                      })}
                      value={(value?.[credentialTypeFieldConfig.name as keyof TSecretData])}
                      placeholder={credentialTypeFieldConfig.placeholder}
                      type={credentialTypeFieldConfig.type}
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
