

export function capitalize(str:string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export function removeCharacters(str:string){
    if(!str) return '';
    return str.replace(/[^a-zA-Z0-9 ]/g, " ");
}

