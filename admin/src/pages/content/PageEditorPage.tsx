import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Modal, Space, Spin, Tabs, Tag, Typography, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useBlocker, useParams } from "react-router-dom";
import { fetchPage, saveDraft } from "../../api/content";
import { ApiError } from "../../api/client";
import type { PageContent, PageDetail } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { canonicalJson, countUntranslated } from "../../content/blockForms";
import { BlockList } from "../../content/BlockList";
import type { Errors } from "../../content/FieldEditor";
import { ListError } from "../ListError";
import { SeoTab } from "./SeoTab";

type Doc = {
  id: number;
  path: string;
  name: string;
  content: PageContent;
  revision: number;
  saved: string;
  savedCanonical: string;
  published: { number: number; canonical: string } | null;
};

function fromDetail(detail: PageDetail): Doc {
  return {
    id: detail.id,
    path: detail.path,
    name: detail.name,
    content: detail.draft.content,
    revision: detail.draft.revision,
    saved: JSON.stringify(detail.draft.content),
    savedCanonical: canonicalJson(detail.draft.content),
    published: detail.published
      ? { number: detail.published.number, canonical: canonicalJson(detail.published.content) }
      : null,
  };
}

function Editor({ id }: { id: number }) {
  const { can } = useAuth();
  const readOnly = !can("content.edit");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["page", id], queryFn: () => fetchPage(id), gcTime: 0, staleTime: 0 });
  const [doc, setDoc] = useState<Doc | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [conflict, setConflict] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (query.data && !doc) setDoc(fromDetail(query.data));
  }, [query.data, doc]);

  const serialized = useMemo(() => (doc ? JSON.stringify(doc.content) : ""), [doc]);
  const dirty = doc !== null && serialized !== doc.saved;
  const untranslated = useMemo(() => (doc ? countUntranslated(doc.content) : 0), [doc]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setContent = useCallback((updater: (content: PageContent) => PageContent) => {
    setDoc((prev) => (prev ? { ...prev, content: updater(prev.content) } : prev));
  }, []);

  const save = useMutation({
    mutationFn: ({ content, revision }: { content: PageContent; revision: number }) => saveDraft(id, content, revision),
  });

  const onSave = async () => {
    if (!doc || readOnly) return;
    const sent = doc.content;
    try {
      const result = await save.mutateAsync({ content: sent, revision: doc.revision });
      setDoc((prev) =>
        prev
          ? { ...prev, revision: result.revision, saved: JSON.stringify(sent), savedCanonical: canonicalJson(sent) }
          : prev,
      );
      setErrors({});
      setConflict(false);
      setProblem(null);
      void queryClient.invalidateQueries({ queryKey: ["pages"] });
      void message.success("Đã lưu nháp");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConflict(true);
        setProblem(null);
      } else if (error instanceof ApiError && error.status === 400) {
        setErrors(error.fields ?? {});
        setProblem("Dữ liệu chưa hợp lệ, hãy kiểm tra các trường được đánh dấu đỏ");
      } else {
        setProblem(error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ");
      }
    }
  };

  const reload = () => {
    Modal.confirm({
      title: "Tải bản mới nhất?",
      content: "Các thay đổi chưa lưu của bạn sẽ bị mất.",
      okText: "Tải và bỏ thay đổi",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await query.refetch();
        if (result.data) {
          setDoc(fromDetail(result.data));
          setErrors({});
          setConflict(false);
          setProblem(null);
        } else {
          void message.error("Không tải được bản mới nhất");
        }
      },
    });
  };

  if (query.isError) return <ListError error={query.error} onRetry={() => void query.refetch()} />;
  if (!doc) return <Spin />;

  const seoErrors = Object.keys(errors).some((key) => key.startsWith("seo."));
  const status = !doc.published ? (
    <Tag>Chưa xuất bản</Tag>
  ) : doc.published.canonical !== doc.savedCanonical ? (
    <Tag color="gold">Có thay đổi chưa xuất bản</Tag>
  ) : (
    <Tag color="green">Đã xuất bản</Tag>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Link to="/pages">
        <ArrowLeftOutlined /> Danh sách trang
      </Link>
      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Space wrap align="center">
          <Typography.Title level={3} style={{ margin: 0 }}>
            {doc.name}
          </Typography.Title>
          <Typography.Text type="secondary">{doc.path}</Typography.Text>
          {status}
          {doc.published ? <Typography.Text type="secondary">Phiên bản {doc.published.number}</Typography.Text> : null}
          {untranslated > 0 ? <Tag color="orange">{untranslated} chỗ chưa dịch</Tag> : null}
          {dirty ? <Tag color="blue">Chưa lưu</Tag> : null}
        </Space>
        {readOnly ? (
          <Tag>Chỉ xem</Tag>
        ) : (
          <Button type="primary" disabled={!dirty} loading={save.isPending} onClick={() => void onSave()}>
            Lưu nháp
          </Button>
        )}
      </Space>
      {conflict ? (
        <Alert
          type="error"
          showIcon
          message="Trang đã được người khác sửa"
          description="Thay đổi của bạn chưa được ghi đè. Hãy tải bản mới nhất rồi sửa lại."
          action={
            <Button size="small" onClick={reload}>
              Tải bản mới nhất
            </Button>
          }
        />
      ) : null}
      {problem ? <Alert type="error" showIcon message={problem} /> : null}
      <Tabs
        items={[
          {
            key: "content",
            label: "Nội dung",
            children: (
              <BlockList
                blocks={doc.content.blocks}
                onChange={(blocks) => setContent((content) => ({ ...content, blocks }))}
                onReorder={() => setErrors({})}
                errors={errors}
                readOnly={readOnly}
              />
            ),
          },
          {
            key: "seo",
            label: seoErrors ? (
              <span>
                SEO <Tag color="red">Có lỗi</Tag>
              </span>
            ) : (
              "SEO"
            ),
            children: (
              <SeoTab
                seo={doc.content.seo}
                onChange={(seo) => setContent((content) => ({ ...content, seo }))}
                errors={errors}
                readOnly={readOnly}
              />
            ),
          },
        ]}
      />
      <Modal
        open={blocker.state === "blocked"}
        title="Chưa lưu thay đổi"
        okText="Rời trang"
        cancelText="Ở lại"
        okButtonProps={{ danger: true }}
        onOk={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        Bạn có thay đổi chưa lưu. Rời trang sẽ làm mất các thay đổi này.
      </Modal>
    </Space>
  );
}

export function PageEditorPage() {
  const { id } = useParams();
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric < 1) return <ListError error={new ApiError(404, "NOT_FOUND", "Không tìm thấy trang")} onRetry={() => undefined} />;
  return <Editor key={numeric} id={numeric} />;
}
