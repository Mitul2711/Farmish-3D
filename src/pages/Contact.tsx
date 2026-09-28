import { type FormEvent } from "react";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";
import { IMGS } from "@/lib/journeyStore";

const fieldClassName = "w-full rounded-xl border border-[#E8D9BF] bg-[#FFFDF9] px-4 py-3.5 text-sm text-[#1D2B25] outline-none transition placeholder:text-[#7A796E] focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15";

export default function Contact() {
  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const subject = String(data.get("subject") ?? "Farmish enquiry");
    const message = String(data.get("message") ?? "").trim();
    const body = [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, "", message].join("\n");

    window.location.href = `mailto:hello@farmish.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#1D2B25] antialiased">
      <NavigationHeader sticky />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-20">
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#A36E1F]">We&apos;re here to help</p>
          <h1 className="mt-3 font-heading text-4xl text-[#1D2B25] sm:text-5xl">Get in touch</h1>
          <p className="mt-2 text-base text-[#53635D]">We&apos;d love to hear from you.</p>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <form onSubmit={sendMessage} className="space-y-4" aria-label="Contact form">
            <label className="sr-only" htmlFor="contact-name">Your name</label>
            <input className={fieldClassName} id="contact-name" name="name" placeholder="Your Name" autoComplete="name" required />

            <label className="sr-only" htmlFor="contact-email">Your email</label>
            <input className={fieldClassName} id="contact-email" name="email" type="email" placeholder="Your Email" autoComplete="email" required />

            <label className="sr-only" htmlFor="contact-phone">Phone number</label>
            <input className={fieldClassName} id="contact-phone" name="phone" type="tel" placeholder="Phone Number (optional)" autoComplete="tel" />

            <label className="sr-only" htmlFor="contact-subject">Select a subject</label>
            <select className={`${fieldClassName} appearance-auto`} id="contact-subject" name="subject" defaultValue="" required>
              <option value="" disabled>Select a Subject</option>
              <option value="Order support">Order support</option>
              <option value="Product question">Product question</option>
              <option value="Grower partnership">Grower partnership</option>
              <option value="Other enquiry">Other enquiry</option>
            </select>

            <label className="sr-only" htmlFor="contact-message">Your message</label>
            <textarea className={`${fieldClassName} min-h-32 resize-y`} id="contact-message" name="message" placeholder="Your Message" required />

            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D4A359] px-6 py-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#E8B86D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]">
              Send Message <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-xs leading-relaxed text-[#7A796E]">This opens your email app with your message ready to send.</p>
          </form>

          <section className="space-y-8" aria-label="Farmish contact details">
            <a href="tel:+919876543210" className="flex items-start gap-4 group">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-[#2E7055]" aria-hidden="true" />
              <span>
                <span className="block font-heading text-xl text-[#1D2B25]">Phone</span>
                <span className="mt-1 block text-sm text-[#53635D] transition-colors group-hover:text-[#285A43]">+91 98765 43210</span>
              </span>
            </a>
            <a href="mailto:hello@farmish.com" className="flex items-start gap-4 group">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-[#2E7055]" aria-hidden="true" />
              <span>
                <span className="block font-heading text-xl text-[#1D2B25]">Email</span>
                <span className="mt-1 block text-sm text-[#53635D] transition-colors group-hover:text-[#285A43]">hello@farmish.com</span>
              </span>
            </a>
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#2E7055]" aria-hidden="true" />
              <span>
                <span className="block font-heading text-xl text-[#1D2B25]">Address</span>
                <span className="mt-1 block text-sm text-[#53635D]">123 Farmish Lane, Gujarat, India</span>
              </span>
            </div>

            <a
              href="https://maps.google.com/?q=Gujarat,India"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-[#D9C8A5] bg-cover bg-center p-6 text-center transition-colors hover:border-[#A36E1F]"
              style={{ backgroundImage: `linear-gradient(rgba(247,242,232,0.58),rgba(247,242,232,0.58)),url("${IMGS.landscape}")` }}
            >
              <span className="rounded-full border border-[#E8D9BF] bg-[#FFFDF9]/90 px-5 py-3 text-sm font-medium text-[#285A43] shadow-sm backdrop-blur-sm">
                View Farmish in Gujarat
              </span>
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}