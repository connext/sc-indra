export { expect } from "chai";

export const mkAddress = (prefix = "0xa"): string => {
  return prefix.padEnd(42, "0");
};

export const mkPublicIdentifier = (prefix = "indra"): string => {
  return prefix.padEnd(55, "1");
};

export const mkBytes32 = (prefix = "0xa"): string => {
  return prefix.padEnd(66, "0");
};
