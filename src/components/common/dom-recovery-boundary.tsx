"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  recoveryKey: number;
};

export default class DOMRecoveryBoundary extends React.Component<
  Props,
  State
> {
  private recovering = false;

  state: State = {
    hasError: false,
    recoveryKey: 0,
  };

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
      recoveryKey: 0,
    };
  }

  componentDidCatch(error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    const isDOMMutationError =
      message.includes("removeChild") ||
      message.includes("insertBefore") ||
      message.includes("NotFoundError") ||
      message.includes("The node to be removed is not a child") ||
      message.includes("The child can not be found");

    if (!isDOMMutationError || this.recovering) {
      return;
    }

    this.recovering = true;

    // Give the browser a moment to finish the external DOM mutation.
    requestAnimationFrame(() => {
      this.setState(
        (prev) => ({
          hasError: false,
          recoveryKey: prev.recoveryKey + 1,
        }),
        () => {
          this.recovering = false;
        }
      );
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <React.Fragment key={`recovery-${this.state.recoveryKey}`}>
          {this.props.children}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={`app-${this.state.recoveryKey}`}>
        {this.props.children}
      </React.Fragment>
    );
  }
}