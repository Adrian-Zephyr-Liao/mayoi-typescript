import { UserCard } from "./card";
import { readUser } from "./legacy.js";

export const legacyScreen = <UserCard name={readUser().name} />;
