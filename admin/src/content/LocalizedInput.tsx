import { Input, Tag, Typography } from "antd";
import type { Localized } from "../api/types";

type Props = {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  path: string;
  multiline?: boolean;
  max?: number;
  optional?: boolean;
  readOnly?: boolean;
  errorVi?: string;
  errorEn?: string;
};

function Cell(props: {
  caption: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline: boolean;
  max?: number;
  disabled: boolean;
  error?: string;
  testId: string;
}) {
  const { caption, label, value, onChange, multiline, max, disabled, error, testId } = props;
  const common = {
    value,
    disabled,
    maxLength: max,
    status: error ? ("error" as const) : undefined,
    "aria-label": `${label} (${caption})`,
    "aria-invalid": error ? true : undefined,
    "data-testid": testId,
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {caption}
      </Typography.Text>
      {multiline ? (
        <Input.TextArea {...common} autoSize={{ minRows: 3, maxRows: 10 }} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input {...common} onChange={(event) => onChange(event.target.value)} />
      )}
      {error ? (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {error}
        </Typography.Text>
      ) : null}
    </div>
  );
}

export function LocalizedInput(props: Props) {
  const { label, value, onChange, path, multiline = false, max, optional = false, readOnly = false } = props;
  const safe: Localized = { vi: value?.vi ?? "", en: value?.en ?? "" };
  const untranslated = safe.vi.trim() !== "" && safe.en.trim() === "";
  const invalid = Boolean(props.errorVi || props.errorEn);
  return (
    <div data-testid={path} data-invalid={invalid ? "true" : undefined} style={{ marginBottom: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <Typography.Text strong>{label}</Typography.Text>
        {optional ? (
          <Typography.Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
            (không bắt buộc)
          </Typography.Text>
        ) : null}
        {untranslated ? (
          <Tag color="orange" style={{ marginLeft: 8 }}>
            Chưa dịch
          </Tag>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Cell
          caption="VI"
          label={label}
          value={safe.vi}
          onChange={(vi) => onChange({ ...safe, vi })}
          multiline={multiline}
          max={max}
          disabled={readOnly}
          error={props.errorVi}
          testId={`${path}.vi`}
        />
        <Cell
          caption="EN"
          label={label}
          value={safe.en}
          onChange={(en) => onChange({ ...safe, en })}
          multiline={multiline}
          max={max}
          disabled={readOnly}
          error={props.errorEn}
          testId={`${path}.en`}
        />
      </div>
    </div>
  );
}
