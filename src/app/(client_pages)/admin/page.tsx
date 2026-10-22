import Admin from "./admin_page";

export default function AdminPage(){

    return <Admin initialProjects={[]} onSaveProjects={async (proj) => { void proj }} />
}