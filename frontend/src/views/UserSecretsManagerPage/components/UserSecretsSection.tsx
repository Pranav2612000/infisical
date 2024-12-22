import Head from "next/head";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button, DeleteActionModal } from "@app/components/v2";
import { usePopUp } from "@app/hooks";
import { useDeleteUserSecret } from "@app/hooks/api/userSecrets";

import { AddUserSecretModal } from "./AddUserSecretModal";
import { UpdateUserSecretModal } from "./UpdateUserSecretModal";
import { UserSecretsTable } from "./UserSecretsTable";

type DeleteModalData = { name: string; id: string };

export const UserSecretsSection = () => {
  const deleteUserSecret = useDeleteUserSecret();
  const { popUp, handlePopUpToggle, handlePopUpClose, handlePopUpOpen } = usePopUp([
    "createUserSecret",
    "deleteUserSecretConfirmation",
    "updateUserSecret"
  ] as const);

  const onDeleteApproved = async () => {
    try {
      await deleteUserSecret.mutateAsync({
        userSecretId: (popUp?.deleteUserSecretConfirmation?.data as DeleteModalData)?.id
      });
      createNotification({
        text: "Successfully deleted shared secret",
        type: "success"
      });

      handlePopUpClose("deleteUserSecretConfirmation");
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete shared secret",
        type: "error"
      });
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <Head>
        <title>User Secrets</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Head>
      <div className="mb-4 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">User Secrets</p>
        <Button
          colorSchema="primary"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => {
            handlePopUpOpen("createUserSecret");
          }}
        >
          Add Secret
        </Button>
      </div>
      <UserSecretsTable handlePopUpOpen={handlePopUpOpen} />
      <UpdateUserSecretModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} handlePopUpClose={handlePopUpClose}/>
      <AddUserSecretModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} handlePopUpClose={handlePopUpClose}/>
      <DeleteActionModal
        isOpen={popUp.deleteUserSecretConfirmation.isOpen}
        title={`Delete ${
          (popUp?.deleteUserSecretConfirmation?.data as DeleteModalData)?.name || " "
        } user secret?`}
        onChange={(isOpen) => handlePopUpToggle("deleteUserSecretConfirmation", isOpen)}
        deleteKey={(popUp?.deleteUserSecretConfirmation?.data as DeleteModalData)?.name}
        onClose={() => handlePopUpClose("deleteUserSecretConfirmation")}
        onDeleteApproved={onDeleteApproved}
      />
    </div>
  );
};
