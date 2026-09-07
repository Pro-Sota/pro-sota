import { LucideIcon } from "lucide-react";

export interface FolderItemType {
    id:string;
    name: string;
    href: string;
    icon: LucideIcon;
    children?: FolderItemType[];
}