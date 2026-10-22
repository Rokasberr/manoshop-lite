import { Check, LockKeyhole, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Notice, PageHeader } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

type ProgramDay = { day: number; phase?: number; phaseLabel?: string; focus: string; challenge: string; reflection: string };

export function ProgramPage() {
  const { user, setUser } = useAuth(); const [duration, setDuration] = useState<number>(user?.resetDuration || 7); const [program, setProgram] = useState<ProgramDay[]>([]); const [error, setError] = useState("");
  const load = useCallback(async (value: number) => { setError(""); try { const result = await api<{ program: ProgramDay[] }>(`/programs/${value}`); setProgram(result.program); setDuration(value); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not load program."); } }, []);
  useEffect(() => { void load(duration); }, [duration, load]);
  const select = async (value: number) => { if (value !== user?.resetDuration && !confirm(`Start a new ${value} Day Reset from Day 1?`)) return; try { const result = await api<{ user: NonNullable<typeof user> }>("/programs/select", { method: "POST", body: { duration: value } }); setUser(result.user); await load(value); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not select program."); } };
  return <div className="product-page"><PageHeader eyebrow="YOUR RESET PROGRAM" title={`${duration} Day Reset`} description="One focus, one challenge, and one reflection for every day." action={<button className="button button-ghost" onClick={() => select(duration)}><RefreshCw size={16} /> Restart</button>} /><div className="duration-tabs">{[7,30,60,90].map(value => <button key={value} className={duration === value ? "active" : ""} onClick={() => user?.lifetime.active || value === 7 ? load(value) : setError("Founding Lifetime access unlocks 30, 60, and 90 day programs.")}>{value} days{!user?.lifetime.active && value > 7 && <LockKeyhole size={13} />}</button>)}</div>{error && <Notice tone={error.includes("Lifetime") ? "neutral" : "error"}>{error}</Notice>}<section className="program-list">{program.map(day => <article key={day.day} className={day.day === 1 ? "current" : ""}><div className="day-node">{day.day < 1 ? <Check /> : day.day}</div><div><small>DAY {String(day.day).padStart(2,"0")} {day.phaseLabel && `· ${day.phaseLabel}`}</small><h2>{day.focus}</h2><p><strong>Challenge:</strong> {day.challenge}</p><p><strong>Reflection:</strong> {day.reflection}</p></div></article>)}</section>{duration !== user?.resetDuration && program.length > 0 && <div className="sticky-action"><span>Previewing the {duration} Day Reset</span><button className="button button-primary" onClick={() => select(duration)}>Start this program</button></div>}</div>;
}
