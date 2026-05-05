import Image from "next/image";

export function InteractiveHeroScene() {
  return (
    <div className="hero-scene-layer" aria-hidden="true">
      <Image
        src="/hero/hero-scene-full.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1280px"
        className="hero-scene-image hero-scene-image--light"
      />
      <Image
        src="/hero/hero-scene-full-dark.webp"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 1280px"
        className="hero-scene-image hero-scene-image--dark"
      />
      <div className="hero-scene-scrim" />
      <div className="hero-scene-glow hero-scene-glow--one" />
      <div className="hero-scene-glow hero-scene-glow--two" />
    </div>
  );
}
