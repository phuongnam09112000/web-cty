import type { PageContent } from "../../api/types";
import type { FieldSpec } from "../../content/blockForms";
import { ObjectFields, type Errors } from "../../content/FieldEditor";

const SEO_FIELDS: FieldSpec[] = [
  { key: "title", label: "Tiêu đề SEO", kind: "localized", max: 300 },
  { key: "description", label: "Mô tả SEO", kind: "localized", max: 300 },
  { key: "image", label: "Ảnh chia sẻ", kind: "media", nullable: true },
];

type Props = {
  seo: PageContent["seo"];
  onChange: (seo: PageContent["seo"]) => void;
  errors: Errors;
  readOnly: boolean;
};

export function SeoTab({ seo, onChange, errors, readOnly }: Props) {
  return (
    <div style={{ maxWidth: 900 }}>
      <ObjectFields
        specs={SEO_FIELDS}
        value={seo}
        onChange={(next) => onChange(next as PageContent["seo"])}
        path="seo"
        errors={errors}
        readOnly={readOnly}
      />
    </div>
  );
}
