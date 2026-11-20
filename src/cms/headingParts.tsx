import type { Heading, Lang } from "./types";
import { pick } from "./pick";

export const HEADING_SEPARATOR_NBSP = " ";
export const HEADING_SEPARATOR_SPACE = " ";

type Options = { separator: string; emphasisFirst?: boolean };

export function renderHeading(heading: Heading, lang: Lang, options: Options) {
  const { separator, emphasisFirst = false } = options;
  const lead = pick(heading.lead, lang);
  const emphasis = pick(heading.emphasis, lang);
  const trail = pick(heading.trail, lang);
  const tail =
    trail !== "" ? (
      <>
        {separator}
        {trail}
      </>
    ) : null;
  if (emphasisFirst) {
    return (
      <>
        <em>{emphasis}</em>
        {separator}
        {lead}
        {tail}
      </>
    );
  }
  return (
    <>
      {lead}
      {separator}
      <em>{emphasis}</em>
      {tail}
    </>
  );
}
