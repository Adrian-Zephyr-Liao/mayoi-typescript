import getUser from "./user";

/** @returns {import("./user").User} */
export function readUser() {
  return getUser();
}
