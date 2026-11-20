import { Component, type ReactNode } from "react";

type Props = { type: string; onError: () => void; children: ReactNode };

class BlockBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Khối "${this.props.type}" bị lỗi và được ẩn`, error);
    }
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default BlockBoundary;
