import { createClient } from "../app/lib/supabase/client";


export async function getAllFolders() {

    try {
        const supabase = createClient();

        const { data, error } = await supabase.from("folders").select("*");

        if (error) throw new Error(error.message);

        return data;
    } catch (error) {
        console.error("Error fetching folders:", error);
        return null;
    }
}

export async function getFolder(folderId: string) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("folder_id", folderId)
            .maybeSingle();

        if (error) throw new Error(error.message);

        return data;
    } catch (error) {
        console.error(`Error fetching folder ${folderId}:`, error);
        return null;
    }
}

export async function getFolderDocuments(folderId: string) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("parent_id", folderId);

        if (error) throw new Error(error.message);

        return data;

    } catch (error) {
        console.error(`Error fetching documents for folder ${folderId}:`, error);
        return null;
    }
}