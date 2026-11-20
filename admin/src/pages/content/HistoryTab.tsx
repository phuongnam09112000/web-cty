import { useQuery } from "@tanstack/react-query";
import { Button, Modal, Space, Spin, Table, Typography } from "antd";
import { useState } from "react";
import { fetchVersion, fetchVersions } from "../../api/content";
import type { VersionListItem } from "../../api/types";
import { BlockList } from "../../content/BlockList";
import { formatDateTime } from "../../format/date";
import { ListError } from "../ListError";

type Props = {
  pageId: number;
  canRestore: boolean;
  onRestore: (version: VersionListItem) => void;
};

function VersionViewer({ pageId, number, onClose }: { pageId: number; number: number; onClose: () => void }) {
  const query = useQuery({ queryKey: ["version", pageId, number], queryFn: () => fetchVersion(pageId, number), gcTime: 0 });
  return (
    <Modal open title={`Phiên bản ${number}`} width={900} onCancel={onClose} footer={<Button onClick={onClose}>Đóng</Button>} destroyOnClose>
      {query.isError ? (
        <ListError error={query.error} onRetry={() => void query.refetch()} />
      ) : !query.data ? (
        <Spin />
      ) : (
        <BlockList blocks={query.data.content.blocks} onChange={() => undefined} onReorder={() => undefined} errors={{}} readOnly />
      )}
    </Modal>
  );
}

export function HistoryTab({ pageId, canRestore, onRestore }: Props) {
  const versions = useQuery({ queryKey: ["versions", pageId], queryFn: () => fetchVersions(pageId), gcTime: 0, staleTime: 0 });
  const [viewing, setViewing] = useState<number | null>(null);

  if (versions.isError) return <ListError error={versions.error} onRetry={() => void versions.refetch()} />;

  return (
    <>
      <Table<VersionListItem>
        rowKey="number"
        size="middle"
        loading={versions.isLoading}
        dataSource={versions.data ?? []}
        pagination={false}
        locale={{ emptyText: "Trang chưa có phiên bản xuất bản nào" }}
        columns={[
          { title: "Phiên bản", dataIndex: "number", width: 110 },
          { title: "Người xuất bản", key: "by", render: (_, row) => row.publishedBy?.fullName ?? "—" },
          { title: "Thời gian", key: "at", width: 160, render: (_, row) => formatDateTime(row.publishedAt) },
          {
            title: "Ghi chú",
            key: "note",
            render: (_, row) => (row.note ? <Typography.Text>{row.note}</Typography.Text> : <Typography.Text type="secondary">—</Typography.Text>),
          },
          {
            title: "",
            key: "actions",
            width: 200,
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => setViewing(row.number)}>
                  Xem
                </Button>
                {canRestore ? (
                  <Button size="small" onClick={() => onRestore(row)}>
                    Khôi phục
                  </Button>
                ) : null}
              </Space>
            ),
          },
        ]}
      />
      {viewing !== null ? <VersionViewer pageId={pageId} number={viewing} onClose={() => setViewing(null)} /> : null}
    </>
  );
}
