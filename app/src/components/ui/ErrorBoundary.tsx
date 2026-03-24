import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AppError } from '@/utils/tsHelpers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: sendToErrorReporting(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-gray-900 mb-2"
            >
              Oops! Something went wrong
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
            >
              We're sorry, but something unexpected happened. Our team has been notified.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <motion.button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>

              <motion.button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reload Page
              </motion.button>
            </motion.div>

            {/* Error details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-left"
              >
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details
                </summary>
                <div className="bg-gray-100 rounded p-3 text-xs text-gray-600 overflow-auto max-h-40">
                  <div className="font-semibold mb-1">Error:</div>
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <div className="font-semibold mt-2 mb-1">Component Stack:</div>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </motion.details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError
}) => {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = (error: Error | AppError, context?: string) => {
    const appError = error instanceof AppError ? error : new AppError(error.message, 'UNKNOWN_ERROR');
    
    // Log the error
    console.error(`Error${context ? ` in ${context}` : ''}:`, appError);
    
    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      // Example: sendToErrorReporting(appError, context);
    }
    
    // You could also show a toast notification here
    // showErrorToast(appError.message);
  };

  const handleAsyncError = async (
    asyncOperation: () => Promise<any>,
    context?: string
  ): Promise<any> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, context);
      throw error;
    }
  };

  return {
    handleError,
    handleAsyncError
  };
};

// Higher-order component for error handling
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
