"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Agar andar ka koi component crash kare (Facebook/Instagram webview me
 * audio player, Google login, embeds etc.), to sirf wahi component gayab
 * hoga. Poora page "This page couldn't load" nahi dikhayega.
 */
export default class SafeBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[SafeBoundary] component crashed:", error);
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}