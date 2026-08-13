import { HiArrowRight } from 'react-icons/hi'

const collections = [
  {
    title: 'The HD Lace Edit',
    eyebrow: 'New arrivals',
    copy: 'Barely-there lace, glueless wear and a hairline made for close-up confidence.',
    image: '/images/Wig Kellyin HDlace 1.jpeg',
    align: 'left',
  },
  {
    title: 'The Bouncy Collection',
    eyebrow: 'Volume and movement',
    copy: 'Soft donor hair with body, shine and a camera-ready finish.',
    image: '/images/12a.jpeg',
    align: 'right',
  },
]

export default function EditorialCollections() {
  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="collections" className="border-y border-white/10 bg-[#090807] text-white">
      {collections.map((collection, index) => (
        <article key={collection.title} className="grid min-h-[74vh] overflow-hidden md:grid-cols-[1.08fr_0.92fr]">
          <div className={`${collection.align === 'right' ? 'md:order-2' : ''} relative min-h-[430px] overflow-hidden bg-black`}>
            <img
              src={collection.image}
              alt={collection.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-white/20 pt-4 text-xs uppercase tracking-[0.2em] text-white/75">
              <span>{collection.eyebrow}</span>
              <span className="text-[#c9a84c]">0{index + 1}</span>
            </div>
          </div>
          <div className="flex items-center bg-[#10100e] px-5 py-14 md:px-14 lg:px-20">
            <div className="max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c9a84c]">{collection.eyebrow}</p>
              <h2 className="mt-4 font-display text-5xl leading-none text-white md:text-7xl">{collection.title}</h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-400">{collection.copy}</p>
              <button
                onClick={scrollToShop}
                className="mt-8 inline-flex items-center gap-2 border-b border-[#c9a84c] pb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#c9a84c] transition-colors hover:text-white"
              >
                Shop collection
                <HiArrowRight size={17} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
