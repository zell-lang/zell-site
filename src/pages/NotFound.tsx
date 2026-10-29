import { Link } from "react-router-dom";
import { usePageTitle } from "../components/Layout";

export default function NotFound() {
  usePageTitle("Not found");
  return (
    <section className="band">
      <div className="wrap section-head">
        <p className="eyebrow">404</p>
        <h1>This page does not exist</h1>
        <p>It may have moved. The <Link to="/">home page</Link> and the <a href="/docs/">documentation</a> are good places to start.</p>
      </div>
    </section>
  );
}
