export type ColumnId = string;

export interface Column {
    id: ColumnId;
    title: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    columnId: ColumnId;
    members?: string[];
    dueDate?: string;
    labels?: string[];
}