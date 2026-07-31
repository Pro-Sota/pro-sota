
export type Status =
  | "em-curso"
  | "concluido"
  | "em-observacao";


export type Project = {
  id: number;
  name: string;
  client: string;
  progress: number;
  priority: "Low" | "Medium" | "High";
  status: Status;
  dueDate: string;
  location: string;
  image:string;
};