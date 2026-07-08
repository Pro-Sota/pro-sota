
export type DocumentType = {
    id: string;
    name: string;
    folder_id:string;
    document_type:string;
    revision_id:string;
    category: string;
    createdBy: string;
    uploadedAt: string;
}

export type FolderType = {
    id: string;
    name: string;
    parent_folder_id:string;
    project_id: string;
    createdBy: string;
    createdAt: string;
}

export interface FolderItemType {
    id:string;
    name: string;
    href: string;
    onSelect: (value:string) => void;
    icon?: any;
    children?: FolderItemType[];
}