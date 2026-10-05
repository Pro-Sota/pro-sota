export function getInitials(firstName = "", lastName = "") {
  return (
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() ||
    "?"
  );
}

export function getAvatarColor() {
  return "bg-[#002950]";
}