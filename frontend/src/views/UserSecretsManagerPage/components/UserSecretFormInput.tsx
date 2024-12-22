import { useState } from "react";
import { Noop, RefCallBack } from "react-hook-form";
import { format, parse } from "date-fns";
import { z } from "zod";

import { DatePicker, Input, TextArea } from "@app/components/v2";

export type Props = {
  type: string,
  value: string,
  placeholder: string,
  onChange: (e: string) => void,
  field: {
    onBlur: Noop,
    disabled?: boolean,
    name: string;
    ref: RefCallBack
  }
  credentialTypeValFields: {
    maxLength?: number,
    validator: z.ZodString;
  }
};

export const UserSecretFormInput = ({
  onChange,
  placeholder,
  type,
  value,
  field,
  credentialTypeValFields
}: Props) => {
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);

  if (["date"].includes(type)) {
    return (<DatePicker
      value={value ? parse(value, "dd-MM-yyyy", new Date()) : undefined}
      onChange={(val) => onChange(val ? format(val, "dd-MM-yyyy") : "")}
      dateFormat="PPP"
      popUpProps={{
        open: isStartDatePickerOpen,
        onOpenChange: setIsStartDatePickerOpen
      }}
      popUpContentProps={{}}
    />);
  }

  if (["textarea"].includes(type)) {
    return (
      <TextArea
        {...field}
        {...credentialTypeValFields}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        placeholder={placeholder}
        rows={3}
        className="thin-scrollbar w-full !resize-none bg-mineshaft-900"
      />
    );
  }

  return (
    <Input
      {...field}
      {...credentialTypeValFields}
      onChange={(e) => onChange(e.target.value)}
      value={value?.toString()}
      placeholder={placeholder}
      type={type}
    />
  )
};
