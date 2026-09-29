import type { MemberAvatarProps } from "./types";
import { avatarColor, initials } from "./utils";

/* -------------------------------------------------------------------------- */
/* Member avatar                                                              */
/* -------------------------------------------------------------------------- */

export function MemberAvatar({
  member,
  size = "medium",
}: MemberAvatarProps) {
  const sizeClass =
    size === "small"
      ? "h-5 w-5 text-[8px]"
      : "h-8 w-8 text-[10px]";

  if (member.picture) {
    return (
      <img
        src={member.picture}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full font-bold text-white ${avatarColor(
        member.name,
      )}`}
    >
      {initials(member.name)}
    </span>
  );
}