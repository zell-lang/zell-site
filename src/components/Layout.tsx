import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/** Header and footer around every page; scrolls to the top, or to `#id`, on navigation. */
export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const el = hash && document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

const BASE_TITLE = "Zell — a compiled language for services and tools";

/** Sets the document title for a page; the home page keeps the full title. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Zell` : BASE_TITLE;
  }, [title]);
}
