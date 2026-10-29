import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Download from "./pages/Download";
import Why from "./pages/Why";
import Performance from "./pages/Performance";
import NotFound from "./pages/NotFound";
import DocsHome from "./docs/DocsHome";
import DocsLayout from "./docs/DocsLayout";
import SectionIndex from "./docs/SectionIndex";
import DocArticle from "./docs/DocArticle";
import StdlibIndex from "./docs/stdlib/StdlibIndex";
import StdlibNamespace from "./docs/stdlib/StdlibNamespace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="download" element={<Download />} />
          <Route path="why" element={<Why />} />
          <Route path="performance" element={<Performance />} />
          <Route path="docs" element={<DocsHome />} />
          <Route path="docs" element={<DocsLayout />}>
            <Route path="reference/stdlib" element={<StdlibIndex />} />
            <Route path="reference/stdlib/:ns" element={<StdlibNamespace />} />
            <Route path=":section" element={<SectionIndex />} />
            <Route path=":section/:slug" element={<DocArticle />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
