import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, InputNumber, Select, Space, Typography } from "antd";
import type { Localized } from "../api/types";
import { emptyItem, emptyValue, type FieldSpec } from "./blockForms";
import { LocalizedInput } from "./LocalizedInput";
import { MediaPicker, type MediaValue } from "./MediaPicker";

export type Errors = Record<string, string>;

export type FieldProps = {
  spec: FieldSpec;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
  errors: Errors;
  readOnly: boolean;
};

export function firstError(errors: Errors, path: string): string | undefined {
  if (errors[path]) return errors[path];
  const prefix = `${path}.`;
  const key = Object.keys(errors).find((candidate) => candidate.startsWith(prefix));
  return key ? errors[key] : undefined;
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function localized(value: unknown): Localized {
  const source = record(value);
  return {
    vi: typeof source.vi === "string" ? source.vi : "",
    en: typeof source.en === "string" ? source.en : "",
  };
}

export function ObjectFields(props: {
  specs: FieldSpec[];
  value: unknown;
  onChange: (value: Record<string, unknown>) => void;
  path: string;
  errors: Errors;
  readOnly: boolean;
}) {
  const { specs, value, onChange, path, errors, readOnly } = props;
  const current = record(value);
  return (
    <>
      {specs.map((spec) => (
        <FieldEditor
          key={spec.key}
          spec={spec}
          value={current[spec.key]}
          onChange={(next) => onChange({ ...current, [spec.key]: next })}
          path={`${path}.${spec.key}`}
          errors={errors}
          readOnly={readOnly}
        />
      ))}
    </>
  );
}

function PlainLabel({ label, error, children, path }: { label: string; error?: string; children: React.ReactNode; path: string }) {
  return (
    <div data-testid={path} data-invalid={error ? "true" : undefined} style={{ marginBottom: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <Typography.Text strong>{label}</Typography.Text>
      </div>
      {children}
      {error ? (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {error}
        </Typography.Text>
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: "8px 12px", margin: "0 0 12px" }}>
      <legend style={{ fontSize: 13, padding: "0 6px", color: "#666" }}>{title}</legend>
      {children}
    </fieldset>
  );
}

function ListEditor({ spec, value, onChange, path, errors, readOnly }: FieldProps) {
  const items = Array.isArray(value) ? value : [];
  const min = spec.min ?? 0;
  const max = spec.max ?? Number.MAX_SAFE_INTEGER;
  const fixed = min === max;
  const itemLabel = spec.itemLabel ?? "Mục";
  const update = (index: number, next: unknown) => onChange(items.map((item, i) => (i === index ? next : item)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [taken] = copy.splice(index, 1);
    copy.splice(target, 0, taken);
    onChange(copy);
  };
  const listError = errors[path];
  return (
    <Group title={`${spec.label} (${items.length}/${max})`}>
      {items.map((item, index) => {
        const itemPath = `${path}.${index}`;
        const title = `${itemLabel} ${index + 1}`;
        return (
          <div
            key={index}
            data-testid={itemPath}
            style={{ borderLeft: "3px solid #e6f0f7", paddingLeft: 12, marginBottom: 12 }}
          >
            <Space style={{ marginBottom: 8 }}>
              <Typography.Text strong>{title}</Typography.Text>
              {readOnly || fixed ? null : (
                <>
                  <Button size="small" icon={<ArrowUpOutlined />} aria-label={`Chuyển ${title} lên`} disabled={index === 0} onClick={() => move(index, -1)} />
                  <Button size="small" icon={<ArrowDownOutlined />} aria-label={`Chuyển ${title} xuống`} disabled={index === items.length - 1} onClick={() => move(index, 1)} />
                  <Button size="small" danger icon={<DeleteOutlined />} aria-label={`Xóa ${title}`} disabled={items.length <= min} onClick={() => onChange(items.filter((_, i) => i !== index))} />
                </>
              )}
            </Space>
            {spec.item ? (
              <ObjectFields specs={spec.item} value={item} onChange={(next) => update(index, next)} path={itemPath} errors={errors} readOnly={readOnly} />
            ) : (
              <FieldEditor
                spec={{ key: String(index), label: title, kind: spec.itemKind ?? "localized" }}
                value={item}
                onChange={(next) => update(index, next)}
                path={itemPath}
                errors={errors}
                readOnly={readOnly}
              />
            )}
          </div>
        );
      })}
      {listError ? (
        <Typography.Text type="danger" style={{ fontSize: 12, display: "block" }}>
          {listError}
        </Typography.Text>
      ) : null}
      {readOnly || fixed ? null : (
        <Button
          icon={<PlusOutlined />}
          disabled={items.length >= max}
          aria-label={`Thêm ${itemLabel.toLowerCase()}: ${spec.label}`}
          onClick={() => onChange([...items, emptyItem(spec)])}
        >
          Thêm {itemLabel.toLowerCase()}
        </Button>
      )}
    </Group>
  );
}

export function FieldEditor(props: FieldProps) {
  const { spec, value, onChange, path, errors, readOnly } = props;
  switch (spec.kind) {
    case "localized":
    case "localizedArea":
      return (
        <LocalizedInput
          label={spec.label}
          value={localized(value)}
          onChange={onChange}
          path={path}
          multiline={spec.kind === "localizedArea"}
          max={spec.max ?? (spec.kind === "localizedArea" ? 5000 : 300)}
          optional={spec.optional}
          readOnly={readOnly}
          errorVi={errors[`${path}.vi`]}
          errorEn={errors[`${path}.en`]}
        />
      );
    case "heading": {
      const heading = record(value);
      const set = (key: string, next: Localized) => {
        const merged = { ...heading, [key]: next };
        const trail = localized(merged.trail);
        if (key === "trail" && trail.vi.trim() === "" && trail.en.trim() === "") delete merged.trail;
        onChange(merged);
      };
      return (
        <Group title={spec.label}>
          <LocalizedInput label={`${spec.label}: phần đầu`} value={localized(heading.lead)} onChange={(next) => set("lead", next)} path={`${path}.lead`} max={300} readOnly={readOnly} errorVi={errors[`${path}.lead.vi`]} errorEn={errors[`${path}.lead.en`]} />
          <LocalizedInput label={`${spec.label}: phần nhấn mạnh`} value={localized(heading.emphasis)} onChange={(next) => set("emphasis", next)} path={`${path}.emphasis`} max={300} optional readOnly={readOnly} errorVi={errors[`${path}.emphasis.vi`]} errorEn={errors[`${path}.emphasis.en`]} />
          <LocalizedInput label={`${spec.label}: phần cuối`} value={localized(heading.trail)} onChange={(next) => set("trail", next)} path={`${path}.trail`} max={300} optional readOnly={readOnly} errorVi={errors[`${path}.trail.vi`]} errorEn={errors[`${path}.trail.en`]} />
        </Group>
      );
    }
    case "link": {
      const target = record(value);
      return (
        <Group title={spec.label}>
          <LocalizedInput label={`${spec.label}: nhãn`} value={localized(target.label)} onChange={(next) => onChange({ ...target, label: next })} path={`${path}.label`} max={300} readOnly={readOnly} errorVi={errors[`${path}.label.vi`]} errorEn={errors[`${path}.label.en`]} />
          <PlainLabel label={`${spec.label}: đường dẫn`} path={`${path}.href`} error={errors[`${path}.href`]}>
            <Input
              value={typeof target.href === "string" ? target.href : ""}
              disabled={readOnly}
              status={errors[`${path}.href`] ? "error" : undefined}
              aria-invalid={errors[`${path}.href`] ? true : undefined}
              aria-label={`${spec.label}: đường dẫn`}
              placeholder="/duong-dan, #neo hoặc https://..."
              onChange={(event) => onChange({ ...target, href: event.target.value })}
            />
          </PlainLabel>
        </Group>
      );
    }
    case "href":
    case "text":
    case "textarea": {
      const error = firstError(errors, path);
      const common = {
        value: typeof value === "string" ? value : "",
        disabled: readOnly,
        status: error ? ("error" as const) : undefined,
        "aria-invalid": error ? true : undefined,
        "aria-label": spec.label,
        maxLength: spec.max,
        placeholder: spec.kind === "href" ? "/duong-dan, #neo hoặc https://..." : undefined,
      };
      return (
        <PlainLabel label={spec.label} path={path} error={error}>
          {spec.kind === "textarea" ? (
            <Input.TextArea {...common} autoSize={{ minRows: 3, maxRows: 10 }} onChange={(event) => onChange(event.target.value)} />
          ) : (
            <Input {...common} onChange={(event) => onChange(event.target.value)} />
          )}
        </PlainLabel>
      );
    }
    case "number": {
      const error = firstError(errors, path);
      return (
        <PlainLabel label={spec.label} path={path} error={error}>
          <InputNumber
            min={spec.min}
            max={spec.max}
            precision={0}
            value={typeof value === "number" ? value : null}
            disabled={readOnly}
            status={error ? "error" : undefined}
            aria-label={spec.label}
            onChange={(next) => onChange(next ?? emptyValue(spec))}
          />
        </PlainLabel>
      );
    }
    case "select": {
      const error = firstError(errors, path);
      return (
        <PlainLabel label={spec.label} path={path} error={error}>
          <Select
            virtual={false}
            style={{ minWidth: 220 }}
            value={value as string | number}
            options={spec.options}
            disabled={readOnly}
            status={error ? "error" : undefined}
            aria-label={spec.label}
            onChange={(next: string | number) => onChange(next)}
          />
        </PlainLabel>
      );
    }
    case "media":
      return (
        <MediaPicker
          label={spec.label}
          value={(value ?? null) as MediaValue}
          onChange={onChange}
          path={path}
          nullable={spec.nullable}
          readOnly={readOnly}
          error={firstError(errors, path)}
        />
      );
    case "list":
      return <ListEditor {...props} />;
  }
}
