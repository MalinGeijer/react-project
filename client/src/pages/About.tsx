import { ABOUT_TEXT } from '../config/site';

export default function About() {
  return (
    <section className="flex flex-col md:flex-row p-16 gap-16">
      <img
        src="https://robohash.org/marvin.png?size=600x800"
        alt="Marvin the Robot"
        className="shadow-lg rounded-lg max-w-[400px] object-cover"
      />

      <div className="flex flex-col gap-4">
        <h1>About</h1>
        <p className="whitespace-pre-wrap">{ABOUT_TEXT}</p>
      </div>
    </section>
  );
}
