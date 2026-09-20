import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/hero/hero";
import { Stack } from "@/components/sections/stack";
import { Work } from "@/components/sections/work";

/**
 * The whole site. One page, anchor navigation, no router — with two projects
 * the case-study depth lives inline rather than behind a click.
 */
export default function Page() {
  return (
    <>
      <div id="top" />
      <Hero />
      <Work />
      <About />
      <Stack />
      <Contact />
    </>
  );
}
