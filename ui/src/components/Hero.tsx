const Hero = () => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto py-16 md:py-20">
        <div className="reveal-fold">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
            Community Election.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Privacy Preserved.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Cast your encrypted vote for community committee candidates. Your vote remains private until decryption.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;

