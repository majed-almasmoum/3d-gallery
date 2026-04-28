import { getSiteContent } from "@/lib/site";
import { HomeClient } from "./home-client";

export default async function Home() {
  const content = await getSiteContent();

  return <HomeClient initialContent={content} />;
}
