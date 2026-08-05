import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProjects() {
  try {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.from("projects").select("*");
    if (error) throw new Error(error.message);

    console.log("data: " + data)
    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}