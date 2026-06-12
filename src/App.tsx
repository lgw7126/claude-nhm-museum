import { useState, useEffect, useRef } from 'react'
import {
  motion,
  AnimatePresence,
  usePresence,
  useAnimation,
} from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Bone,
  Dna,
  Gem,
  Leaf,
  BookOpen,
  Plus,
} from 'lucide-react'
import './index.css'

// ─── Data ────────────────────────────────────────────────────────────────────

const chaptersData = [
  { name: 'Age of Dinosaurs', image: 'https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624247/01_udnber.png' },
  { name: 'Fossils of Ancient Life', image: 'https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624374/02_pmvxxl.png' },
  { name: 'Reptiles of the Mesozoic', image: 'https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624236/03_hcp3jc.png' },
  { name: 'Marine Fossil Gallery', image: 'https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624256/04_get63z.png' },
  { name: 'Prehistoric Giants', image: 'https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624251/05_kz1tyu.png' },
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── SandTransitionImage ─────────────────────────────────────────────────────

function SandTransitionImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [isPresent, safeToRemove] = usePresence()
  const filterIdRef = useRef(`sand-${Math.random().toString(36).slice(2)}`)
  const filterId = filterIdRef.current
  const turbRef = useRef<SVGFETurbulenceElement>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
  const offsetRef = useRef<SVGFEOffsetElement>(null)
  const blurRef = useRef<SVGFEGaussianBlurElement>(null)
  const matrixRef = useRef<SVGFEColorMatrixElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const duration = 900
    const start = performance.now()
    const entering = isPresent

    const animate = (now: number) => {
      const raw = Math.min((now - start) / duration, 1)
      const t = entering
        ? 1 - Math.pow(1 - raw, 4)
        : Math.pow(raw, 3)
      const progress = entering ? t : t

      const scale = entering ? 150 * (1 - progress) : 150 * progress
      const dy = entering ? -80 * (1 - progress) : 120 * progress
      const dx = entering ? -30 * (1 - progress) : 30 * progress
      const blur = entering ? 6 * (1 - progress) : 6 * progress
      const opacity = entering
        ? Math.min(1, progress * 1.5)
        : Math.max(0, 1 - progress * 1.2)

      if (dispRef.current) dispRef.current.setAttribute('scale', String(scale))
      if (offsetRef.current) {
        offsetRef.current.setAttribute('dy', String(dy))
        offsetRef.current.setAttribute('dx', String(dx))
      }
      if (blurRef.current) blurRef.current.setAttribute('stdDeviation', String(blur))
      if (matrixRef.current)
        matrixRef.current.setAttribute(
          'values',
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`
        )

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else if (!entering) {
        safeToRemove?.()
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPresent]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="1.8"
              numOctaves={4}
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale={150}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feOffset ref={offsetRef} in="displaced" dx={-30} dy={-80} result="offset" />
            <feGaussianBlur ref={blurRef} in="offset" stdDeviation={6} result="blurred" />
            <feColorMatrix
              ref={matrixRef}
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 0"
            />
          </filter>
        </defs>
      </svg>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${filterId})` }}
      />
    </>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [showVideo, setShowVideo] = useState(false)
  const [activeChapter, setActiveChapter] = useState(2)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCta, setHoveredCta] = useState(false)
  const dinoControls = useAnimation()

  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), 2800)
    return () => clearTimeout(t)
  }, [])

  // Video walking sequence: slide in from right → stop at center → scaleX flip (look at camera) → continue left → loop
  useEffect(() => {
    let cancelled = false
    const delay = (ms: number) =>
      new Promise<void>((r) => { const id = setTimeout(r, ms); if (cancelled) clearTimeout(id) })

    const walk = async () => {
      while (!cancelled) {
        // Start: shifted right, invisible
        dinoControls.set({ x: '35vw', scaleX: 1, opacity: 0 })

        // Fade in + stride left
        await dinoControls.start({
          x: '0vw',
          opacity: 1,
          transition: { duration: 5, ease: 'linear' },
        })
        if (cancelled) break

        // Decelerate to a stop
        await dinoControls.start({
          x: '-5vw',
          transition: { duration: 1.4, ease: [0.25, 1, 0.5, 1] },
        })
        if (cancelled) break

        // Turn to face camera (mirror horizontally)
        await dinoControls.start({
          scaleX: -1,
          transition: { duration: 0.5, ease: 'easeInOut' },
        })
        if (cancelled) break

        // Stare
        await delay(1800)
        if (cancelled) break

        // Turn back
        await dinoControls.start({
          scaleX: 1,
          transition: { duration: 0.5, ease: 'easeInOut' },
        })
        if (cancelled) break

        // Stride off to the left
        await dinoControls.start({
          x: '-45vw',
          transition: { duration: 5, ease: 'linear' },
        })
        if (cancelled) break

        // Fade out before reset
        await dinoControls.start({
          opacity: 0,
          transition: { duration: 0.6 },
        })
        if (cancelled) break

        await delay(400)
      }
    }

    walk()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % 5)
    }, 3500)
    return () => clearInterval(iv)
  }, [])

  const navLinks = ['Visit', 'Exhibitions', 'Discover', 'Learn', 'About']

  return (
    <div className="w-full">
      {/* ── SECTION 1: HERO ── */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden">

        {/* Background Video — walks left, pauses to look at camera, continues */}
        {showVideo && (
          <motion.div
            animate={dinoControls}
            initial={{ opacity: 0, x: '30vw' }}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              src="https://res.cloudinary.com/dsdxaxkiz/video/upload/v1779624998/magnific_use-img-2-as-the-exact-ba_Piu3X0W42C_wnrc8f.mp4"
            />
          </motion.div>
        )}

        {/* Header / Logo */}
        <motion.header
          className="pt-6 px-6 md:px-16 z-20"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
        >
          {/* NHM SVG Logo */}
          <motion.h1
            className="w-full"
            variants={{
              initial: {},
              animate: { scale: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
            }}
            style={{ margin: 0 }}
          >
            <svg viewBox="0 0 840 100" className="w-full fill-[#111]" xmlns="http://www.w3.org/2000/svg">
              {/* N */}
              <g transform="translate(0,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="0,0 33,0 214,100 181,100" />
              </g>
              {/* H */}
              <g transform="translate(280,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="14,43 200,43 200,57 14,57" />
              </g>
              {/* M */}
              <g transform="translate(560,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="266,0 280,0 280,100 266,100" />
                <motion.polygon variants={letterBlock} points="0,0 26,0 153,100 127,100" />
                <motion.polygon variants={letterBlock} points="254,0 280,0 153,100 127,100" />
              </g>
            </svg>
          </motion.h1>

          {/* Sub-nav */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-between items-start mt-8"
          >
            {/* Left */}
            <div className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase w-[15%]">
              <div>Natura</div>
              <div>History</div>
              <div>Museum</div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex w-[5%] justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            {/* Center */}
            <div className="flex-1 md:w-[30%] md:flex-none text-gray-800 leading-relaxed font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase">
              <span className="hidden md:block">
                Exploring the story of life on earth<br />
                through science, discovery<br />
                and wonder.
              </span>
              <span className="md:hidden">
                Exploring the story<br />
                of life on earth through<br />
                science, discovery<br />
                and wonder.
              </span>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex w-[5%] justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            {/* Nav links */}
            <div className="hidden md:flex flex-col w-[15%] text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase text-gray-800 gap-1">
              {navLinks.map((link) => (
                <a key={link} href="#" className="hover:text-black hover:underline transition-colors">
                  {link}
                </a>
              ))}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="relative z-[60] flex flex-col gap-[6px] ml-4 md:ml-0 cursor-pointer bg-transparent border-none p-0"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={
                  isMobileMenuOpen
                    ? { rotate: 45, y: 7.5, width: 32 }
                    : { rotate: 0, y: 0, width: 32 }
                }
                transition={{ duration: 0.3 }}
                className="h-[1.5px] bg-black origin-center"
                style={{ width: 32 }}
              />
              <motion.div
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, y: -7.5, width: 32 }
                    : { rotate: 0, y: 0, width: 32 }
                }
                transition={{ duration: 0.3 }}
                className="h-[1.5px] bg-black origin-center"
                style={{ width: 32 }}
              />
            </button>
          </motion.div>
        </motion.header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-[#fcfcfc] border-b border-gray-200 shadow-xl z-50 px-8 py-8"
            >
              <nav className="space-y-6">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-sm font-mono tracking-[0.2em] uppercase text-gray-800 hover:text-black transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Sidebar Content */}
        <motion.div
          className="px-10 md:px-16 mt-20 sm:mt-28 md:mt-32 w-[320px] z-10"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } } }}
        >
          {/* Section indicator */}
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="flex items-center gap-3 mb-6">
            <span className="text-xs font-mono text-gray-500">01</span>
            <div className="w-16 h-[1.5px] bg-black/20" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1] mb-6"
            style={{ margin: 0, marginBottom: 24 }}
          >
            TIMELESS<br />WONDERS
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6] mb-8"
          >
            Step into the natural world and<br />
            discover the stories written<br />
            millions of years ago.
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <motion.button
              onHoverStart={() => setHoveredCta(true)}
              onHoverEnd={() => setHoveredCta(false)}
              whileHover={{ y: -0.5, boxShadow: '3px 3px 0px rgba(17,17,17,0.5)' }}
              whileTap={{ y: 0, boxShadow: 'none' }}
              className="relative overflow-hidden bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm flex items-center gap-3 cursor-pointer"
            >
              {/* Sliding bg panel */}
              <motion.div
                className="absolute inset-0 bg-[#fcfcfc]"
                initial={{ x: '-101%' }}
                animate={{ x: hoveredCta ? '0%' : '-101%' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Leaf icon */}
              <motion.div
                className="relative z-10"
                animate={hoveredCta ? { scale: 1.1, rotate: -12, y: -4 } : { scale: 1, rotate: 0, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 2C5 2 2 6 2 9c0 4 3 7 7 7"
                    stroke={hoveredCta ? '#111' : 'white'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M9 2c4 0 7 4 7 7 0 4-3 7-7 7"
                    stroke={hoveredCta ? '#111' : 'white'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M9 2v14"
                    stroke={hoveredCta ? '#111' : 'white'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 6c1.5 1.5 3 2 4 3"
                    stroke={hoveredCta ? '#111' : 'white'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              <span
                className="relative z-10 text-[15px] font-medium transition-colors duration-300"
                style={{ color: hoveredCta ? '#111' : 'white' }}
              >
                Explore Now
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          className="hidden md:flex flex-col absolute right-16 top-0 w-[200px] mt-12 md:mt-20 z-10 pt-48 gap-6"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } } }}
        >
          {/* Specimen info */}
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <div className="text-[10px] font-bold font-mono tracking-widest uppercase mb-1">
              Tyrannosaurus Rex
            </div>
            <div className="text-[12px] text-gray-600 leading-[1.6]">
              Late Cretaceous period<br />
              68–66 million years ago
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="flex flex-col gap-3">
            {[
              { label: 'Length', value: '12.3 m' },
              { label: 'Height', value: '4.0 m' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500">{s.label}</div>
                <div className="text-[13px] font-medium">{s.value}</div>
              </div>
            ))}
          </motion.div>

          {/* View Details */}
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <motion.button
              whileHover="hovered"
              initial="rest"
              className="flex items-center gap-3 bg-transparent border-none p-0 cursor-pointer group"
            >
              <motion.div
                variants={{
                  rest: { borderColor: 'rgb(156,163,175)', backgroundColor: 'transparent' },
                  hovered: { borderColor: '#111', backgroundColor: '#111' },
                }}
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center"
              >
                <motion.div
                  variants={{ rest: { color: '#111' }, hovered: { color: 'white' } }}
                >
                  <Plus size={16} strokeWidth={1.5} />
                </motion.div>
              </motion.div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">View Details</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bottom-left scroll hint */}
        <motion.div
          className="absolute bottom-10 left-[2.5rem] md:left-[4rem] hidden md:flex items-center gap-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center gap-[4px]">
            <div className="w-[1px] h-[12px] bg-gray-600" />
            <div className="w-[1px] h-[12px] bg-gray-600" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">
            Scroll to explore
          </span>
        </motion.div>
      </section>

      {/* ── SECTION 2: EXPLORE OUR WORLD ── */}
      <section className="relative w-full min-h-[75vh] md:min-h-screen bg-[#fcfcfc] flex flex-col items-center pt-24 md:pt-32 pb-0 z-20">

        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 mb-12 text-[10px] md:text-[11px] font-mono tracking-[0.2em]"
        >
          <span className="text-gray-500">[ 02 ]</span>
          <span className="text-gray-900 font-bold uppercase">Explore Our World</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9 }}
          className="text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111] max-w-[1000px] text-center px-8 mb-12"
          style={{ margin: '0 0 48px' }}
        >
          Unearth the stories of our planet's past<br className="hidden md:block" />
          {' '}through fossils, minerals, and ancient wonders.
        </motion.h2>

        {/* Action Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-24 px-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
        >
          {[
            { icon: <Bone size={14} strokeWidth={2} />, label: 'Dinosaurs' },
            { icon: <Dna size={14} strokeWidth={2} />, label: 'Ancient Life' },
            { icon: <Gem size={14} strokeWidth={2} />, label: 'Minerals' },
            { icon: <Leaf size={14} strokeWidth={2} />, label: 'Fossils' },
            { icon: <BookOpen size={14} strokeWidth={2} />, label: 'Learn More' },
          ].map((pill) => (
            <motion.button
              key={pill.label}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 hover:border-black hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
            >
              {pill.icon}
              {pill.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Spacer for pterodactyl overlap */}
        <div className="min-h-[220px] md:min-h-[450px] w-full" />

        {/* Bottom Text */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-8 md:pb-12 pointer-events-none hidden md:flex justify-between">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            WE DON'T JUST TELL STORIES.
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            PALEONTOLOGY (C) 2026
          </span>
        </div>
      </section>

      {/* ── SECTION 3: ANCIENT COLLECTION (Dark) ── */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30">

        {/* Pterodactyl Image */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-0"
          style={{ top: 0 }}
          initial={{ y: '-65%', opacity: 0 }}
          whileInView={{ y: '-78%', opacity: 1 }}
          viewport={{ once: true, margin: '100px' }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <img
            src="https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779625001/ChatGPT_Image_May_23_2026_12_24_44_PM_1_lv1dne.png"
            alt="Pterodactyl"
            className="w-[160vw] md:w-[1100px]"
          />
        </motion.div>

        {/* Heading Area */}
        <div className="px-8 md:px-16 pt-32 md:pt-48 mb-16 z-10 flex flex-col xl:flex-row justify-between gap-12">
          {/* Left heading */}
          <div className="max-w-[700px]">
            <h2
              className="text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white"
              style={{ margin: 0 }}
            >
              Curated from millions of years of wonder{' '}
              <span className="inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-4" style={{ transform: 'translateY(-4px)' }}>
                {[Bone, Dna, Leaf].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ backgroundColor: 'white', borderColor: 'white', color: 'black' }}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400 flex items-center justify-center cursor-pointer"
                  >
                    <Icon size={22} />
                  </motion.button>
                ))}
              </span>{' '}
              &amp; discovery.
            </h2>
          </div>

          {/* Right tagline + pills */}
          <div className="flex flex-col gap-4 xl:max-w-[260px]">
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase leading-relaxed">
              WE DON'T JUST DISPLAY FOSSILS<br />
              WE SHARE EARTH'S STORY
            </p>
            <div className="flex flex-wrap gap-2">
              {['Educational', 'Authentic', 'Inspiring'].map((label) => (
                <motion.button
                  key={label}
                  whileHover={{ backgroundColor: 'white', borderColor: 'white', color: 'black' }}
                  className="px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300 cursor-pointer bg-transparent transition-colors"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-800 mx-0" />

        {/* Two-Column Panel */}
        <div className="flex flex-col md:flex-row z-10">
          {/* Left panel */}
          <div className="md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[400px] md:min-h-[500px] flex flex-col justify-between p-8 relative">
            <div className="text-gray-500 text-xl tracking-[0.3em]">***</div>

            {/* Sand image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={activeChapter}
                  src={chaptersData[activeChapter].image}
                  alt={chaptersData[activeChapter].name}
                  className="absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten"
                />
              </AnimatePresence>
            </div>

            {/* Chapter counter */}
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
              <div className="overflow-hidden h-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: 16 }}
                    animate={{ y: 0 }}
                    exit={{ y: -16 }}
                    transition={{ duration: 0.4 }}
                    className="block text-[#888]"
                  >
                    {String(activeChapter + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[#333]">/</span>
              <span className="text-[#888]">05</span>
            </div>
          </div>

          {/* Right panel */}
          <div className="md:w-[65%] flex flex-col">
            {/* Top bar */}
            <div className="border-b border-gray-800 p-8 flex justify-between items-center text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              <span>Explore the past. Understand the present.</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeChapter}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  Chapter {String(activeChapter + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Chapter list */}
            {chaptersData.map((chapter, i) => (
              <button
                key={i}
                onClick={() => setActiveChapter(i)}
                className="w-full text-left border-b border-gray-800/80 py-8 px-8 flex items-center justify-between transition-colors duration-300 cursor-pointer bg-transparent border-l-0 border-r-0"
                style={{ color: i === activeChapter ? 'white' : '#444' }}
              >
                <span
                  className="text-2xl md:text-[2rem] font-medium tracking-tight transition-colors duration-300"
                  style={{
                    color: i === activeChapter ? 'white' : undefined,
                  }}
                  onMouseEnter={(e) => { if (i !== activeChapter) e.currentTarget.style.color = '#999' }}
                  onMouseLeave={(e) => { if (i !== activeChapter) e.currentTarget.style.color = '#444' }}
                >
                  {chapter.name}
                </span>
                <AnimatePresence>
                  {i === activeChapter && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowUpRight size={22} strokeWidth={1} className="text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <div className="h-[1px] bg-gray-800" />
        <div className="px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">
          DIGGING INTO OUR PLANET'S PAST
        </div>
      </section>
    </div>
  )
}
