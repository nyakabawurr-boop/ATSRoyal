export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          ATS Resume Tool
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Upload a resume, validate ATS formatting, tailor for job descriptions,
          and generate cover letters - all with transparent scoring and zero
          fabricated facts.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "ATS Format Checker",
            description:
              "Get an ATS-friendly score, parsing preview, and concrete fixes.",
            href: "/ats-check",
          },
          {
            title: "Resume Customizer",
            description:
              "Tailor resume sections, reorder content, and track changes.",
            href: "/customize",
          },
          {
            title: "Cover Letter Generator",
            description:
              "Create a customized cover letter with tone and length controls.",
            href: "/cover-letter",
          },
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400"
          >
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
