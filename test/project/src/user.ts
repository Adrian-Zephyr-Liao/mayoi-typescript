export interface User {
  name: string;
}

export default function getUser(): User {
  return { name: "Mayoi" };
}
