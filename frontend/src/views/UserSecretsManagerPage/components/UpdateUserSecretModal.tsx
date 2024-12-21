import { Modal, ModalContent } from "@app/components/v2";
import { useGetUserSecretById } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UpdateUserSecretForm } from "./UpdateUserSecretForm";

type Props = {
  popUp: UsePopUpState<["updateUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["updateUserSecret"]>,
    state?: boolean
  ) => void;
};

export const UpdateUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  const { data, isLoading } = useGetUserSecretById({
    userSecretId: popUp.updateUserSecret?.data?.id || "",
    enabled: true
  });

  return (
    <Modal
      isOpen={popUp?.updateUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("updateUserSecret", isOpen);
      }}
    >
      <ModalContent
        title="Update User Secret"
        subTitle="Securely store secrets like credit cards, web logins and more"
      >
        {isLoading ? "Loading..." : (
          <UpdateUserSecretForm data={data}/>
        )}
      </ModalContent>
    </Modal>
  );
};
