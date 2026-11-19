import { UserCard } from "./card";
import { getUser, type User } from "@/index";

const user: User = getUser();
export const screen = <UserCard name={user.name} />;
