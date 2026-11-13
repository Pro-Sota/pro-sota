import { ViewTransition, type ReactNode } from "react";

export default function PublicPageTransition({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ViewTransition
      enter="public-page-enter"
      exit="public-page-exit"
      default="none"
    >
      {children}
    </ViewTransition>
  );
}   