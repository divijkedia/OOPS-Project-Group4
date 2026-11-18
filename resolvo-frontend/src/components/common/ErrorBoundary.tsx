import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 ring-8 ring-rose-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-royal-900 tracking-tight">
                An Unexpected Application Error Occurred
              </h2>
              <p className="text-sm text-royal-600">
                The ITIL interface encountered an unhandled exception while rendering this view.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-royal-50 rounded-xl p-4 border border-royal-100 text-xs font-mono text-rose-700 overflow-x-auto max-h-40">
                <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-[10px] text-royal-600 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleReload}
              >
                Reload Window
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Home className="w-4 h-4" />}
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
