import { ExternalLink, Headphones } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, Notice, PageHeader } from "../components/Ui";
import { api } from "../lib/api";
import type { Podcast } from "../types";

const categories = ["All", "Discipline", "Business", "Habits", "Focus", "Health", "Sleep", "Money", "Psychology"];
export function LearnPage() {
  const [category, setCategory] = useState("All"); const [podcasts, setPodcasts] = useState<Podcast[]>([]); const [error, setError] = useState("");
  const load = useCallback(async (value: string) => { setError(""); try { const query = value === "All" ? "" : `?category=${encodeURIComponent(value)}`; const result = await api<{ podcasts: Podcast[] }>(`/content/podcasts${query}`); setPodcasts(result.podcasts); setCategory(value); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not load recommendations."); } }, []);
  useEffect(() => { void load("All"); }, [load]);
  return <div className="product-page"><PageHeader eyebrow="LISTEN INSTEAD OF SCROLLING" title="Learn" description="A small, curated library for walks, chores, and low-energy moments." /><div className="category-scroll">{categories.map(item => <button className={category === item ? "active" : ""} key={item} onClick={() => load(item)}>{item}</button>)}</div>{error && <Notice tone="error">{error}</Notice>}<section className="podcast-grid">{podcasts.map(podcast => <article className="podcast-card" key={podcast._id}><div className="podcast-art"><Headphones /><span>{podcast.category}</span></div><div className="podcast-copy"><small>{podcast.recommendedContext}</small><h2>{podcast.title}</h2><p>{podcast.creator} · {podcast.duration}</p><p>{podcast.description}</p><a className="button button-ghost" href={podcast.spotifyUrl} target="_blank" rel="noreferrer">Open in Spotify <ExternalLink size={15} /></a></div></article>)}</section>{!podcasts.length && <EmptyState title="Recommendations are being curated" text="The admin can add Spotify episodes and shows from the RESET dashboard." />}</div>;
}
