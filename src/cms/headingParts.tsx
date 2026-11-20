import type { Heading, Lang } from "./types";
import { pick } from "./pick";

type Options = { emphasisFirst?: boolean; separator?: string };

export function renderHeading(heading: Heading, lang: Lang, options: Options = {}) {
  const separator = options.separator ?? " ";
  const lead = pick(heading.lead, lang);
  const emphasis = pick(heading.emphasis, lang);
  const trail = pick(heading.trail, lang);
  if (options.emphasisFirst) {
    return (
      <>
        <em>{emphasis}</em>
        {separator}
        {lead}
      </>
    );
  }
  return (
    <>
      {lead}
      {separator}
      <em>{emphasis}</em>
      {trail !== "" && (
        <>
          {separator}
          {trail}
        </>
      )}
    </>
  );
}
