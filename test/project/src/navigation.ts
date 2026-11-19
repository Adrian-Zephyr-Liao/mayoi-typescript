import { greet } from "./greeter.js";
import { getUser, type User } from "@/index";

export interface UserSource {
  get(): User;
}

export class MemoryUsers implements UserSource {
  get(): User {
    return getUser();
  }
}

const inferred = getUser();
export const greeting = greet(inferred.name);
