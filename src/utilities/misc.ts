export const isValidEmail = (email: string) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
};

export const isGmail = (email: string) => {
  return /@gmail\.com$/.test(email);
};
