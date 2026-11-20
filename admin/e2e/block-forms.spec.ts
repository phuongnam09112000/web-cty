import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { BLOCK_FORMS, type FieldSpec } from "../src/content/blockForms";

const samples = JSON.parse(
  readFileSync(new URL("../../server/test/fixtures/block-samples.json", import.meta.url), "utf8"),
) as Record<string, Record<string, unknown>>;

function compare(type: string, specs: FieldSpec[], sample: Record<string, unknown>, where: string) {
  const specKeys = specs.map((spec) => spec.key).sort();
  expect(Object.keys(sample).sort(), `${type} ${where}`).toEqual(specKeys);
  for (const spec of specs) {
    const value = sample[spec.key];
    if (spec.kind === "list" && spec.item && Array.isArray(value) && value.length > 0) {
      for (const entry of value) compare(type, spec.item, entry as Record<string, unknown>, `${where}.${spec.key}`);
    }
  }
}

test("BLOCK_FORMS covers every block type in the samples", () => {
  expect(Object.keys(BLOCK_FORMS).sort()).toEqual(Object.keys(samples).sort());
  expect(Object.keys(BLOCK_FORMS)).toHaveLength(20);
});

for (const [type, sample] of Object.entries(samples)) {
  test(`BLOCK_FORMS["${type}"] matches the sample keys`, () => {
    const form = BLOCK_FORMS[type as keyof typeof BLOCK_FORMS];
    expect(form).toBeDefined();
    expect(form.label.length).toBeGreaterThan(0);
    compare(type, form.fields, sample, "data");
  });
}
