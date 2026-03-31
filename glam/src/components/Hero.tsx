export default function Hero() {
  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background mesh/grain effect */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, #c9a84c22 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, #8b6914 0%, transparent 50%),
                            radial-gradient(ellipse at 60% 80%, #c9a84c11 0%, transparent 50%)`
        }}
      />

      {/* Decorative vertical lines */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/30 to-transparent hidden md:block" />
      <div className="absolute right-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/30 to-transparent hidden md:block" />

      {/* Floating decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-[#c9a84c]/10 animate-spin-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full border border-[#c9a84c]/15" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Eyebrow text */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-[#c9a84c]" />
          <span className="text-[#c9a84c] tracking-[0.4em] text-xs uppercase font-medium">Luxury Hair Experience</span>
          <div className="h-px w-16 bg-[#c9a84c]" />
        </div>

        {/* Main headline */}
        <h1 className="font-display text-6xl sm:text-8xl md:text-[8rem] lg:text-[10rem] leading-none tracking-tight mb-4 text-white">
          YOU
          <span className="block text-[#c9a84c] italic" style={{ fontStyle: 'italic' }}>deserve</span>
          <span className="block">LUXURY</span>
        </h1>

        <p className="mt-8 text-neutral-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light tracking-wide">
          Premium wigs &amp; hair extensions crafted for queens. Elevate your crown — because every day deserves to be a great hair day.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button
            onClick={scrollToShop}
            className="group relative px-10 py-4 bg-[#c9a84c] text-black font-bold tracking-[0.2em] text-sm uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,168,76,0.4)]"
          >
            <span className="relative z-10">Shop Luxury Wigs Now</span>
            <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 text-black font-bold tracking-[0.2em] text-sm uppercase transition-opacity duration-300">
              Shop Luxury Wigs Now
            </span>
          </button>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 border border-[#c9a84c]/50 text-[#c9a84c] font-medium tracking-[0.2em] text-sm uppercase hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all duration-300"
          >
            Contact Us
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto border-t border-[#c9a84c]/20 pt-10">
          {[
            { num: '500+', label: 'Happy Queens' },
            { num: '50+', label: 'Hair Styles' },
            { num: '5★', label: 'Rating' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl text-[#c9a84c]">{stat.num}</div>
              <div className="text-neutral-500 text-xs tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-neutral-600 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#c9a84c]/50 to-transparent" />
      </div>
    </section>
  )
}
