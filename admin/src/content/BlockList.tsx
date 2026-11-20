import { DownOutlined, EyeInvisibleOutlined, EyeOutlined, HolderOutlined, UpOutlined } from "@ant-design/icons";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import type { ContentBlock } from "../api/types";
import { BLOCK_FORMS, countUntranslated } from "./blockForms";
import { ObjectFields, type Errors } from "./FieldEditor";

type Props = {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onReorder: () => void;
  errors: Errors;
  readOnly: boolean;
};

function SortableBlock(props: {
  block: ContentBlock;
  index: number;
  errors: Errors;
  errorCount: number;
  expanded: boolean;
  onToggle: () => void;
  onHide: () => void;
  onData: (data: Record<string, unknown>) => void;
  readOnly: boolean;
}) {
  const { block, index, errors, errorCount, expanded, onToggle, onHide, onData, readOnly } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: readOnly,
  });
  const form = BLOCK_FORMS[block.type];
  const untranslated = countUntranslated(block.data);
  return (
    <div
      ref={setNodeRef}
      data-testid={`block-${block.id}`}
      data-block-id={block.id}
      data-hidden={block.hidden ? "true" : "false"}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : block.hidden ? 0.7 : 1,
        border: `1px solid ${errorCount > 0 ? "#ff4d4f" : "#d9d9d9"}`,
        borderRadius: 8,
        background: "#fff",
        marginBottom: 12,
        position: "relative",
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px" }}>
        {readOnly ? null : (
          <Button
            type="text"
            icon={<HolderOutlined />}
            aria-label="Kéo để sắp xếp"
            style={{ cursor: "grab", touchAction: "none" }}
            {...attributes}
            {...listeners}
          />
        )}
        <Typography.Text type="secondary">{index + 1}.</Typography.Text>
        <Typography.Text strong>{form.label}</Typography.Text>
        <Space size={4} wrap style={{ flex: 1 }}>
          {block.hidden ? <Tag>Đang ẩn</Tag> : null}
          {untranslated > 0 ? <Tag color="orange">{untranslated} chỗ chưa dịch</Tag> : null}
          {errorCount > 0 ? <Tag color="red">Có lỗi</Tag> : null}
        </Space>
        {readOnly ? null : (
          <Button
            icon={block.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            aria-label={block.hidden ? "Hiện khối" : "Ẩn khối"}
            onClick={onHide}
          >
            {block.hidden ? "Hiện" : "Ẩn"}
          </Button>
        )}
        <Button icon={expanded ? <UpOutlined /> : <DownOutlined />} onClick={onToggle}>
          {expanded ? "Thu gọn" : readOnly ? "Xem nội dung" : "Sửa nội dung"}
        </Button>
      </div>
      {expanded ? (
        <div style={{ padding: "4px 16px 12px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ height: 12 }} />
          <ObjectFields
            specs={form.fields}
            value={block.data}
            onChange={onData}
            path={`blocks.${index}.data`}
            errors={errors}
            readOnly={readOnly}
          />
        </div>
      ) : null}
    </div>
  );
}

export function BlockList({ blocks, onChange, onReorder, errors, readOnly }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  useEffect(() => {
    const failing = blocks.filter((_, index) => Object.keys(errors).some((key) => key.startsWith(`blocks.${index}.`)));
    if (failing.length === 0) return;
    setOpen((prev) => {
      if (failing.every((block) => prev.has(block.id))) return prev;
      const next = new Set(prev);
      failing.forEach((block) => next.add(block.id));
      return next;
    });
  }, [errors, blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((block) => block.id === active.id);
    const to = blocks.findIndex((block) => block.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder();
    onChange(arrayMove(blocks, from, to));
  };

  const errorCountOf = (index: number) => Object.keys(errors).filter((key) => key.startsWith(`blocks.${index}.`)).length;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((block, index) => {
          const errorCount = errorCountOf(index);
          return (
            <SortableBlock
              key={block.id}
              block={block}
              index={index}
              errors={errors}
              errorCount={errorCount}
              expanded={open.has(block.id)}
              onToggle={() =>
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(block.id)) next.delete(block.id);
                  else next.add(block.id);
                  return next;
                })
              }
              onHide={() => onChange(blocks.map((item) => (item.id === block.id ? { ...item, hidden: !item.hidden } : item)))}
              onData={(data) => onChange(blocks.map((item) => (item.id === block.id ? { ...item, data } : item)))}
              readOnly={readOnly}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
}
