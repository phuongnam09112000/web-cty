import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Input, Modal, Space, Spin, Tabs, Tag, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useBlocker, useParams } from "react-router-dom";
import { createPreview, fetchPage, publishPage, restoreVersion, saveDraft } from "../../api/content";
import { ApiError } from "../../api/client";
import type { PageContent, PageDetail, VersionListItem } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { canonicalJson, countUntranslated, pruneErrors } from "../../content/blockForms";
import { BlockList } from "../../content/BlockList";
import type { Errors } from "../../content/FieldEditor";
import { ListError } from "../ListError";
import { HistoryTab } from "./HistoryTab";
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
  const canPublish = can("content.publish");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["page", id], queryFn: () => fetchPage(id), gcTime: 0, staleTime: 0 });
  const [doc, setDoc] = useState<Doc | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [conflict, setConflict] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState("");
  const [publishProblem, setPublishProblem] = useState<string | null>(null);

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

  const setContent = (updater: (content: PageContent) => PageContent) => {
    if (!doc) return;
    const next = updater(doc.content);
    setDoc({ ...doc, content: next });
    setErrors((current) => pruneErrors(current, doc.content, next));
  };

  const save = useMutation({
    mutationFn: ({ content, revision }: { content: PageContent; revision: number }) => saveDraft(id, content, revision),
  });

  const persist = async (): Promise<boolean> => {
    if (!doc || readOnly) return false;
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
      return true;
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
      return false;
    }
  };

  const onSave = () => {
    void persist();
  };

  const onPreview = async () => {
    const tab = window.open("", "_blank");
    setPreviewing(true);
    try {
      if (dirty && !readOnly && !(await persist())) {
        tab?.close();
        return;
      }
      const { url } = await createPreview(id);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
    } catch (error) {
      tab?.close();
      setProblem(error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ");
    } finally {
      setPreviewing(false);
    }
  };

  const openPublish = () => {
    setNote("");
    setPublishProblem(null);
    setPublishOpen(true);
  };

  const onPublish = async () => {
    setPublishing(true);
    setPublishProblem(null);
    try {
      if (dirty && !(await persist())) {
        setPublishOpen(false);
        return;
      }
      const result = await publishPage(id, note.trim());
      setDoc((prev) => (prev ? { ...prev, published: { number: result.number, canonical: prev.savedCanonical } } : prev));
      void queryClient.invalidateQueries({ queryKey: ["pages"] });
      void queryClient.invalidateQueries({ queryKey: ["versions", id] });
      setPublishOpen(false);
      void message.success(`Đã xuất bản phiên bản ${result.number}`);
    } catch (error) {
      setPublishProblem(error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ");
    } finally {
      setPublishing(false);
    }
  };

  const onRestore = (version: VersionListItem) => {
    Modal.confirm({
      title: `Khôi phục phiên bản ${version.number}?`,
      content: dirty
        ? "Bản nháp hiện tại và các thay đổi chưa lưu sẽ được thay bằng nội dung của phiên bản này."
        : "Bản nháp hiện tại sẽ được thay bằng nội dung của phiên bản này.",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await restoreVersion(id, version.number);
          const result = await query.refetch();
          if (!result.data) throw new Error("reload");
          setDoc(fromDetail(result.data));
          setErrors({});
          setConflict(false);
          setProblem(null);
          void queryClient.invalidateQueries({ queryKey: ["pages"] });
          void message.success(`Đã khôi phục phiên bản ${version.number} vào bản nháp`);
        } catch (error) {
          void message.error(error instanceof ApiError ? error.message : "Không khôi phục được phiên bản");
        }
      },
    });
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
        <Space wrap>
          {readOnly ? <Tag>Chỉ xem</Tag> : null}
          <Button loading={previewing} onClick={() => void onPreview()}>
            Xem trước
          </Button>
          {readOnly ? null : (
            <Button type={canPublish ? "default" : "primary"} disabled={!dirty} loading={save.isPending} onClick={onSave}>
              Lưu nháp
            </Button>
          )}
          {canPublish ? (
            <Button
              type="primary"
              disabled={!!doc.published && !dirty && doc.published.canonical === doc.savedCanonical}
              onClick={openPublish}
            >
              Xuất bản
            </Button>
          ) : null}
        </Space>
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
          {
            key: "history",
            label: "Lịch sử",
            children: <HistoryTab pageId={id} canRestore={canPublish} onRestore={onRestore} />,
          },
        ]}
      />
      <Modal
        open={publishOpen}
        title="Xuất bản trang"
        okText="Xuất bản"
        cancelText="Hủy"
        confirmLoading={publishing}
        onOk={() => void onPublish()}
        onCancel={() => setPublishOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text>
            {dirty ? "Các thay đổi chưa lưu sẽ được lưu nháp rồi xuất bản lên website." : "Bản nháp hiện tại sẽ được xuất bản lên website."}
          </Typography.Text>
          <label htmlFor="publish-note">Ghi chú</label>
          <Input.TextArea
            id="publish-note"
            value={note}
            maxLength={500}
            showCount
            rows={3}
            onChange={(event) => setNote(event.target.value)}
          />
          {publishProblem ? <Alert type="error" showIcon message={publishProblem} /> : null}
        </Space>
      </Modal>
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
