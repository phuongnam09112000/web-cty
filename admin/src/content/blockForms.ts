export const BLOCK_TYPES = [
  "home-hero",
  "solution-banner",
  "about-banner",
  "home-about",
  "business-areas",
  "home-services",
  "home-values",
  "partners",
  "customers",
  "home-contact",
  "overview",
  "mission",
  "vision",
  "core-values",
  "core-values-system",
  "services-list",
  "our-services",
  "opportunity",
  "office-map",
  "contact-form",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type FieldKind =
  | "text"
  | "textarea"
  | "localized"
  | "localizedArea"
  | "heading"
  | "media"
  | "link"
  | "href"
  | "number"
  | "select"
  | "list";

export type ListItemKind = "localized" | "localizedArea" | "media";

export type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  options?: { value: string | number; label: string }[];
  item?: FieldSpec[];
  itemKind?: ListItemKind;
  itemLabel?: string;
  min?: number;
  max?: number;
  optional?: boolean;
  nullable?: boolean;
};

export const LINE_MAX = 300;
export const PARAGRAPH_MAX = 5000;

const loc = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key,
  label,
  kind: "localized",
  max: LINE_MAX,
  ...extra,
});
const area = (key: string, label: string): FieldSpec => ({ key, label, kind: "localizedArea", max: PARAGRAPH_MAX });
const head = (key: string, label: string): FieldSpec => ({ key, label, kind: "heading", max: LINE_MAX });
const media = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key,
  label,
  kind: "media",
  ...extra,
});
const link = (key: string, label: string): FieldSpec => ({ key, label, kind: "link", max: LINE_MAX });
const hrefField = (key: string, label: string): FieldSpec => ({ key, label, kind: "href" });
const text = (key: string, label: string, max: number, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key,
  label,
  kind: "text",
  min: 1,
  max,
  ...extra,
});
const list = (
  key: string,
  label: string,
  min: number,
  max: number,
  itemLabel: string,
  extra: Partial<FieldSpec>,
): FieldSpec => ({ key, label, kind: "list", min, max, itemLabel, ...extra });

const eyebrow = () => loc("eyebrow", "Dòng nhỏ phía trên");

export const BLOCK_FORMS: Record<BlockType, { label: string; fields: FieldSpec[] }> = {
  "home-hero": {
    label: "Trang chủ: banner chính",
    fields: [
      eyebrow(),
      loc("title", "Tiêu đề"),
      list("slides", "Ảnh trình chiếu", 1, 6, "Ảnh", {
        item: [media("image", "Ảnh"), loc("tagline", "Khẩu hiệu")],
      }),
      link("primaryCta", "Nút chính"),
      link("secondaryCta", "Nút phụ"),
    ],
  },
  "solution-banner": {
    label: "Banner giải pháp",
    fields: [
      media("image", "Ảnh nền"),
      eyebrow(),
      loc("title", "Tiêu đề"),
      loc("subtitle", "Phụ đề"),
      loc("buttonLabel", "Chữ trên nút"),
    ],
  },
  "about-banner": {
    label: "Banner giới thiệu",
    fields: [
      media("image", "Ảnh nền"),
      loc("title", "Tiêu đề"),
      loc("subtitle", "Phụ đề", { optional: true }),
      loc("eyebrow", "Dòng nhỏ phía trên", { optional: true }),
      {
        key: "headingLevel",
        label: "Cấp tiêu đề",
        kind: "select",
        options: [
          { value: 1, label: "Tiêu đề cấp 1" },
          { value: 2, label: "Tiêu đề cấp 2" },
        ],
      },
    ],
  },
  "home-about": {
    label: "Trang chủ: giới thiệu",
    fields: [
      media("image", "Ảnh"),
      loc("foundedLabel", "Nhãn năm thành lập"),
      text("foundedYear", "Năm thành lập", 10),
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      area("lead", "Đoạn dẫn"),
      list("stats", "Số liệu", 0, 4, "Số liệu", {
        item: [text("value", "Giá trị", 10), loc("label", "Nhãn")],
      }),
      link("cta", "Nút kêu gọi"),
    ],
  },
  "business-areas": {
    label: "Lĩnh vực kinh doanh",
    fields: [
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      loc("buttonLabel", "Chữ trên nút"),
      list("areas", "Lĩnh vực", 1, 6, "Lĩnh vực", {
        item: [
          loc("title", "Tên lĩnh vực"),
          area("description", "Mô tả"),
          hrefField("href", "Đường dẫn"),
          media("image", "Ảnh"),
          text("imagePosition", "Vị trí ảnh", 30, { min: 0, optional: true }),
        ],
      }),
    ],
  },
  "home-services": {
    label: "Trang chủ: dịch vụ",
    fields: [
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      link("allLink", "Liên kết xem tất cả"),
      list("items", "Dịch vụ", 1, 6, "Dịch vụ", {
        item: [loc("title", "Tên dịch vụ"), area("description", "Mô tả"), hrefField("href", "Đường dẫn"), media("image", "Ảnh")],
      }),
    ],
  },
  "home-values": {
    label: "Trang chủ: giá trị",
    fields: [
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      area("philosophy", "Triết lý"),
      list("items", "Giá trị", 1, 6, "Giá trị", { item: [loc("name", "Tên giá trị"), area("description", "Mô tả")] }),
    ],
  },
  partners: {
    label: "Đối tác",
    fields: [
      eyebrow(),
      loc("heading", "Tiêu đề"),
      area("intro", "Giới thiệu"),
      { key: "initialCount", label: "Số logo hiện ban đầu", kind: "number", min: 1, max: 50 },
      list("items", "Đối tác", 1, 80, "Đối tác", { item: [text("name", "Tên đối tác", 100), media("logo", "Logo")] }),
    ],
  },
  customers: {
    label: "Khách hàng",
    fields: [
      eyebrow(),
      loc("heading", "Tiêu đề"),
      area("intro", "Giới thiệu"),
      list("items", "Khách hàng", 1, 80, "Khách hàng", { item: [loc("name", "Tên khách hàng"), media("logo", "Logo")] }),
    ],
  },
  "home-contact": {
    label: "Trang chủ: liên hệ",
    fields: [eyebrow(), head("heading", "Tiêu đề lớn"), link("cta", "Nút kêu gọi")],
  },
  overview: {
    label: "Tổng quan",
    fields: [
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      list("images", "Ảnh", 1, 3, "Ảnh", { itemKind: "media" }),
      list("paragraphs", "Đoạn văn", 1, 6, "Đoạn", { itemKind: "localizedArea" }),
      loc("yearBadge", "Nhãn năm"),
    ],
  },
  mission: {
    label: "Sứ mệnh",
    fields: [
      media("image", "Ảnh"),
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      list("points", "Ý chính", 1, 6, "Ý", { itemKind: "localizedArea" }),
    ],
  },
  vision: {
    label: "Tầm nhìn",
    fields: [media("image", "Ảnh"), eyebrow(), head("heading", "Tiêu đề lớn"), area("body", "Nội dung")],
  },
  "core-values": {
    label: "Giá trị cốt lõi",
    fields: [
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      list("items", "Giá trị", 1, 6, "Giá trị", {
        item: [media("icon", "Biểu tượng"), loc("title", "Tên giá trị"), area("description", "Mô tả")],
      }),
    ],
  },
  "core-values-system": {
    label: "Hệ thống giá trị cốt lõi",
    fields: [
      eyebrow(),
      loc("title", "Tiêu đề"),
      list("items", "Nhóm giá trị", 1, 8, "Nhóm", {
        item: [
          loc("title", "Tiêu đề nhóm"),
          list("bullets", "Ý chính", 1, 6, "Ý", { itemKind: "localized" }),
          media("image", "Ảnh"),
          media("icon", "Biểu tượng", { nullable: true }),
        ],
      }),
    ],
  },
  "services-list": {
    label: "Danh sách dịch vụ",
    fields: [
      loc("pageTitle", "Tiêu đề trang"),
      loc("sectionTitle", "Tiêu đề mục"),
      area("text", "Nội dung"),
      media("image", "Ảnh"),
    ],
  },
  "our-services": {
    label: "Dịch vụ của chúng tôi",
    fields: [
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      loc("buttonLabel", "Chữ trên nút"),
      list("items", "Dịch vụ", 1, 6, "Dịch vụ", {
        item: [
          loc("title", "Tên dịch vụ"),
          area("description", "Mô tả"),
          media("icon", "Biểu tượng"),
          hrefField("href", "Đường dẫn"),
          list("categories", "Nhóm dịch vụ", 1, 6, "Nhóm", {
            item: [loc("name", "Tên nhóm"), list("bullets", "Ý chính", 1, 6, "Ý", { itemKind: "localized" })],
          }),
        ],
      }),
    ],
  },
  opportunity: {
    label: "Cơ hội",
    fields: [
      media("image", "Ảnh"),
      loc("subtitle", "Phụ đề"),
      loc("title", "Tiêu đề"),
      area("description", "Mô tả"),
      list("stats", "Số liệu", 0, 4, "Số liệu", { item: [text("value", "Giá trị", 30), loc("label", "Nhãn")] }),
    ],
  },
  "office-map": {
    label: "Bản đồ văn phòng",
    fields: [
      list("offices", "Văn phòng", 2, 2, "Văn phòng", {
        item: [loc("name", "Tên văn phòng"), loc("shortName", "Tên ngắn")],
      }),
    ],
  },
  "contact-form": {
    label: "Biểu mẫu liên hệ",
    fields: [
      {
        key: "variant",
        label: "Kiểu hiển thị",
        kind: "select",
        options: [
          { value: "page", label: "Cả trang" },
          { value: "inline", label: "Nhúng trong trang" },
        ],
      },
      eyebrow(),
      head("heading", "Tiêu đề lớn"),
      loc("tagline", "Khẩu hiệu"),
      loc("formEyebrow", "Dòng nhỏ của biểu mẫu"),
      head("formHeading", "Tiêu đề biểu mẫu"),
    ],
  },
};

export function emptyValue(spec: FieldSpec): unknown {
  switch (spec.kind) {
    case "localized":
    case "localizedArea":
      return { vi: "", en: "" };
    case "heading":
      return { lead: { vi: "", en: "" }, emphasis: { vi: "", en: "" } };
    case "link":
      return { label: { vi: "", en: "" }, href: "" };
    case "media":
      return null;
    case "number":
      return spec.min ?? 0;
    case "select":
      return spec.options?.[0]?.value ?? "";
    case "list":
      return Array.from({ length: spec.min ?? 0 }, () => emptyItem(spec));
    default:
      return "";
  }
}

export function emptyItem(spec: FieldSpec): unknown {
  if (spec.item) return Object.fromEntries(spec.item.map((field) => [field.key, emptyValue(field)]));
  return emptyValue({ key: "", label: "", kind: spec.itemKind ?? "localized" });
}

function isLocalized(value: object): value is { vi: string; en: string } {
  const record = value as Record<string, unknown>;
  return typeof record.vi === "string" && typeof record.en === "string";
}

export function countUntranslated(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((sum, item) => sum + countUntranslated(item), 0);
  if (value !== null && typeof value === "object") {
    if (isLocalized(value)) return value.vi.trim() !== "" && value.en.trim() === "" ? 1 : 0;
    return Object.values(value).reduce<number>((sum, item) => sum + countUntranslated(item), 0);
  }
  return 0;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    }
    return v;
  });
}
