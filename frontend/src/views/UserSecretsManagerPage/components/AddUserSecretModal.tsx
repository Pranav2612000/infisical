import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { AddUserSecretForm } from "./AddUserSecretForm";

type Props = {
  popUp: UsePopUpState<["createUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createUserSecret"]>,
    state?: boolean
  ) => void;
};

export const AddUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  return (
    <Modal
      isOpen={popUp?.createUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createUserSecret", isOpen);
      }}
    >
      <ModalContent
        title="Create a User Secret"
        subTitle="Securely store secrets like credit cards, web logins and more"
      >
        <AddUserSecretForm />
      </ModalContent>
    </Modal>
  );
};
