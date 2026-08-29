import { ArrowLeft, Home, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-16 text-center">
  <div className="w-full rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">404 · Puslapis nerastas</p>
    <h1 className="mt-5 font-display text-4xl font-bold text-stone-950 sm:text-5xl">Šios nuorodos nėra</h1>
    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-600">Nuoroda galėjo pasikeisti arba būti įvesta neteisingai. Galite grįžti į pradžią arba susisiekti su mumis.</p>
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link className="button-primary justify-center" to="/"><Home size={18} /> Į pradžią</Link><button className="button-secondary justify-center" type="button" onClick={() => window.history.back()}><ArrowLeft size={18} /> Grįžti atgal</button><a className="button-secondary justify-center" href="mailto:hello@stilloak-studio.com"><Mail size={18} /> Kontaktai</a></div>
  </div>
</section>;

export default NotFoundPage;
