export const isGmail = (email: string) => {
  return /@gmail\.com$/.test(email);
};
