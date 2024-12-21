import { UserSecretsSection } from "./components";

export const UserSecretsManagerPage = () => {
  return (
    <div className="container mx-auto h-full w-full max-w-7xl bg-bunker-800 px-6 text-white">
      <div className="flex items-center justify-between py-6">
        <div className="flex w-full flex-col">
          <h2 className="text-3xl font-semibold text-gray-200">User Secrets Manager</h2>
          <p className="text-bunker-300">Manage website logins, corporate credit card details, social media accounts, software licenses, and more</p>
        </div>
      </div>
      <UserSecretsSection />
    </div>
  );
};
