export default function BrandStory() {
  return (
    <section id="about" className="bg-[#0d0d0d] px-4 py-18 text-white md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="grid grid-cols-2 gap-3">
          <img src="/images/11b.jpeg" alt="Signature straight luxury hair detail" className="aspect-[3/4] w-full object-cover" loading="lazy" />
          <img src="/images/7.png" alt="Honey blonde Glamoursphair unit" className="mt-10 aspect-[3/4] w-full object-cover" loading="lazy" />
        </div>

        <div className="md:pl-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c9a84c]">The Glamoursphair woman</p>
          <h2 className="mt-3 font-display text-5xl leading-none md:text-7xl">
            Hair designed to make every entrance memorable.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400">
            Glamoursphair blends premium hair selection, refined finishing and direct WhatsApp support for women who want polished beauty without confusion.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Premium finish', 'Clean parting, soft movement and picture-ready styling.'],
              ['Easy buying', 'Shop online, pay securely or confirm details on WhatsApp.'],
              ['Abuja support', 'Studio pickup, consultations and after-order help.'],
            ].map(([title, copy]) => (
              <div key={title} className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
