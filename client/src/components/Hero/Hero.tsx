export default function Hero() {
  return (
    <section className="w-full">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center lg:items-start gap-6">

        {/* Videodelen */}
        <div className="flex-1 w-full">
          <video
            className="w-full h-auto rounded-lg shadow-lg border border-black"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/hero.mp4" type="video/mp4" />
            Din webbläsare stödjer inte videon.
          </video>
        </div>

                {/* Textdelen */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-widest text-base-hover">
            Nyheter
          </h1>

          <p className="text-lg lg:text-xl text-base-muted">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

      </div>
    </section>
  );
}
