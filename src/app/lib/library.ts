

export function capitalize(str:string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export function removeCharacters(str:string){
    if(!str) return '';
    return str.replace(/[^a-zA-Z0-9 ]/g, " ");
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

