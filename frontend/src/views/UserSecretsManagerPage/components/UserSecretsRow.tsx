import { useEffect, useState } from "react";
import { faCopy, faEye, faEyeSlash, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";

import { createNotification } from "@app/components/notifications";
import { Button, IconButton, TableContainer, Td, Tr } from "@app/components/v2";
import { useToggle } from "@app/hooks";
import { TSecretData, TUserSecret, TViewUserSecretResponse, useGetUserSecretById } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { supportedSecretTypes, supportedSecretTypesContentMap } from "../supportedSecretTypes";

const UserSecretField = ({
  row,
  secretField,
  data,
  isSecretVisible
}: {
  row: TUserSecret;
  secretField: string;
  data: TViewUserSecretResponse | undefined;
  isSecretVisible: boolean;
}) => {
  const [isHoveringField, setIsHoveringField] = useState(false);

  return (
    <tr
      key={`user-secret-${row.id}-${secretField}`}
      className="hover:bg-mineshaft-700"
      onMouseEnter={() => setIsHoveringField(true)}
      onMouseLeave={() => setIsHoveringField(false)}
    >
      <td
        className="flex h-full items-center"
        style={{ padding: "0.25rem 1rem" }}
      >
        <div title={secretField} className="flex h-8 w-[8rem] items-center space-x-2 ">
          <span className="truncate">
            {supportedSecretTypes[row.credentialType]
              .find((entry) => (entry.name === secretField))?.label}
          </span>
        </div>
      </td>
      <td
        className="col-span-2 h-8 w-full"
        style={{ padding: "0.25rem 1rem" }}
      >
        <span>{isSecretVisible ? data?.secretData?.[secretField as keyof TSecretData] : "********"}</span>
        {isHoveringField && (
          <IconButton
            onClick={() => {
              const secret = data?.secretData?.[secretField as keyof TSecretData];
              if (!secret) {
                return;
              }
              navigator.clipboard.writeText(data?.secretData?.[secretField as keyof TSecretData]);
              createNotification({
                text: "Secret copied",
                type: "success"
              });
            }}
            variant="plain"
            ariaLabel="copy"
            className="ml-5"
          >
          <FontAwesomeIcon icon={faCopy} />
        </IconButton>
        )}
      </td>
    </tr>
  );
};

export const UserSecretsRow = ({
  row,
  handlePopUpOpen
}: {
  row: TUserSecret;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteUserSecretConfirmation", "updateUserSecret"]>,
    {
      name,
      id
    }: {
      name: string;
      id: string;
    }
  ) => void;
}) => {
  const [isRowExpanded, setIsRowExpanded] = useToggle();
  const [isSecretVisible, setIsSecretVisible] = useToggle();
  const { data, refetch, isFetching} = useGetUserSecretById({
    userSecretId: row.id,
    enabled: false
  });

  useEffect(() => {
    if (!isRowExpanded) {
      return; 
    }
    refetch();
  }, [isRowExpanded]);

  return (
    <>
      <Tr
        isHoverable
        key={row.id}
        className="h-10 cursor-pointer transition-colors duration-300 hover:bg-mineshaft-700"
        onClick={() => setIsRowExpanded.toggle()}
      >
        <Td>{row.name ? `${row.name}` : "-"}</Td>
        <Td>
          {supportedSecretTypesContentMap[row.credentialType]}
        </Td>
        <Td>{`${format(new Date(row.updatedAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
        <Td>{`${format(new Date(row.createdAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
        <Td>
          <div className="flex gap-2">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handlePopUpOpen("updateUserSecret", {
                  name: "update",
                  id: row.id
                });
              }}
              variant="plain"
              ariaLabel="update"
            >
              <FontAwesomeIcon icon={faPencil} />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handlePopUpOpen("deleteUserSecretConfirmation", {
                  name: "delete",
                  id: row.id
                });
              }}
              variant="plain"
              ariaLabel="delete"
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          </div>
        </Td>
      </Tr>
      {isRowExpanded && (
        <Tr>
          <Td
            colSpan={5}
            className={`bg-bunker-600 px-0 py-0 ${isRowExpanded && " border-mineshaft-500 p-8"}`}
          >
            <div
              className="p-2"
            >
              <TableContainer>
                <table className="secret-table">
                  <thead>
                    <tr className="h-10 border-b-2 border-mineshaft-600">
                      <th
                        style={{ padding: "0.5rem 1rem" }}
                        className="min-table-row min-w-[11rem]"
                      >
                        Field
                      </th>
                      <th style={{ padding: "0.5rem 1rem" }} className="border-none">
                        Value
                      </th>
                      <div className="absolute top-0 right-0 ml-auto mt-1 mr-1 w-min">
                        <Button
                          variant="outline_bg"
                          className="p-1"
                          leftIcon={<FontAwesomeIcon icon={isSecretVisible ? faEyeSlash : faEye} />}
                          isLoading={isFetching}
                          onClick={() => setIsSecretVisible.toggle()}
                        >
                          {isSecretVisible ? "Hide Values" : "Reveal Values"}
                        </Button>
                      </div>
                    </tr>
                  </thead>
                  <tbody className="border-t-2 border-mineshaft-600">
                    {Object.keys(row?.secretData || []).map((secretField) => {

                      return (
                        <UserSecretField
                          key={`${row.id}-${secretField}`}
                          row={row}
                          data={data}
                          isSecretVisible={isSecretVisible}
                          secretField={secretField}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          </Td>
        </Tr>
      )}
    </>
  );
};
