
export type DocumentType = {
    id: string;
    name: string;
    category: string;
    uploadedBy: string;
    uploadedAt: string;
    size: string;
}

export type FolderType = {

    id: string;
    name: string;
    type: string;
    projectId: string;
    itemCount: number;
    uploadedBy: string;
    createdAt: string;
    size: string;
}

export interface FolderItemType {
  name: string;
  href: string;
  icon?: any;
  children?: FolderItemType[];
}