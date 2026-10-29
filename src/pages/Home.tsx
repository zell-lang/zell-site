import Hero from "../components/Hero";
import Stats from "../components/Stats";
import CodeTabs from "../components/CodeTabs";
import Compare from "../components/Compare";
import Benchmarks from "../components/Benchmarks";
import Tooling from "../components/Tooling";
import FinalCta from "../components/FinalCta";
import { usePageTitle } from "../components/Layout";

export default function Home() {
  usePageTitle();
  return (
    <>
      <Hero />
      <Stats />
      <CodeTabs />
      <Compare />
      <Benchmarks />
      <Tooling />
      <FinalCta />
    </>
  );
}
