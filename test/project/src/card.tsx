interface UserCardProps {
  /** Name shown on the card. */
  name: string;
}

export function UserCard({ name }: UserCardProps) {
  return <strong>{name}</strong>;
}
