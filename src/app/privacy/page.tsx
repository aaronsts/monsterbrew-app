import Markdown from "react-markdown";
export default function Privacy() {
  const privacyPolicy = `# Privacy Promise
## Hi there!
I built this website as a passion project, and I care about your privacy just as much as I care about creating a great experience for you. Let me share how I approach your data:
### Analytics
I use [**Plausible Analytics**](https://plausible.io/privacy) because it respects your privacy while still giving me insights about how people use this site. Unlike traditional analytics:
- It doesn't use any cookies
- It doesn't know who you are
- It doesn't follow you across the internet
- It just gives me simple stats like which pages are popular and where visitors come from
### My Promise to You
I believe in being straightforward, so here's my commitment:
- I don't collect your personal information
- I don't create profiles about you
- I don't sell data to anyone (seriously, who does that?)
- I don't use your data for ads or marketing
The minimal anonymous data I collect simply helps me make this site better and fix things when they break.
## Questions?
If you have any questions or concerns, feel free to reach out. I'm all about transparency and making sure you're comfortable with how your data is handled. Send me an email at aaron.staes [at] gmail.com
Any changes to this privacy policy will be posted on this page. This policy was last updated on 20th of April 2025.`;
  return (
    <section className="prose max-w-8xl px-6">
      <Markdown>{privacyPolicy}</Markdown>
    </section>
  );
}
