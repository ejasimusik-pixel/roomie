import React from "react";

/**
 * Last-resort global error boundary. Renders a graceful luxury-minimal screen
 * instead of a blank page when a render-time error escapes the component tree.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[Roomie] Uncaught error:", error, info);
  }

  handleReload = () => {
    try {
      window.location.assign("/");
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="min-h-screen rm-bg-aurora flex items-center justify-center px-4"
        data-testid="error-boundary"
      >
        <div className="rm-glass-strong rounded-[2rem] p-10 max-w-md text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-magenta-500 to-violet-500 text-white text-2xl font-bold flex items-center justify-center shadow-glow">
            !
          </div>
          <h1 className="mt-5 font-display font-extrabold text-2xl text-violet-900">
            Algo se rompió
          </h1>
          <p className="mt-2 text-violet-500 text-sm">
            Tomamos nota del problema. Vuelve al inicio y prueba de nuevo.
          </p>
          <button
            onClick={this.handleReload}
            data-testid="error-boundary-reload"
            className="rm-btn-primary mt-7"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}
