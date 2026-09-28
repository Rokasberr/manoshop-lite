import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

export function NotFoundPage() { return <div className="not-found"><Logo /><main><span>404</span><h1>This page is outside the plan.</h1><p>Return to the next useful action.</p><Link className="button button-primary" to="/"><ArrowLeft size={16} /> Go home</Link></main></div>; }
