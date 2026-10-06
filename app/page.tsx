import HomeClient from "./components/HomeClient";
import { getEntries } from "@/lib/music/queries";

export const dynamic = "force-static";

export default async function Home() {
  const entries = await getEntries();
  return <HomeClient entries={entries} />;
}
