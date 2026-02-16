"use client";

import React from "react";
import Button from "@/components/ui/Button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Something broke in this view.</h2>
            <p className="mt-2 text-sm text-slate-700">
              {this.state.error?.message || "An unexpected error occurred while rendering."}
            </p>
            <div className="mt-5 flex justify-center">
              <Button onClick={this.resetError}>Try Again</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
