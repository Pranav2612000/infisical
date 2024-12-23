import { useTranslation } from "react-i18next";
import Head from "next/head";

import { UserSecretsManagerPage } from "@app/views/UserSecretsManagerPage";

const UserSecretsManager = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("common.head-title", { title: t("user-secrets-manager.title") })}</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
        <meta property="og:title" content={String(t("user-secrets-manager.og-title"))} />
        <meta name="og:description" content={String(t("user-secrets-manager.og-description"))} />
      </Head>
      <div className="h-full">
        <UserSecretsManagerPage />
      </div>
    </>
  );
};

export default UserSecretsManager;

UserSecretsManager.requireAuth = true;