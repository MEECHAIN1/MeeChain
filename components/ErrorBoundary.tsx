
import React, { ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary to catch neural link collapses and UI crashes.
 * Explicitly extends React.Component with Props and State generics to ensure 'props' and 'state' properties are correctly typed.
 */
class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Explicitly declare state property for the TypeScript compiler to resolve inheritance errors
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  // Fix: Static method for updating state from errors
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Fix: Life-cycle method for error side effects
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.critical('Global UI Crash Detected', { error, errorInfo });
  }

  public render() {
    // Fix: Using this.state to check for ritual disruption (error state)
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-6 font-mono">
          <div className="glass max-w-xl w-full p-10 rounded-[3rem] border-rose-500/20 text-center space-y-8 shadow-2xl">
            <div className="w-24 h-24 bg-rose-500/10 rounded-full mx-auto flex items-center justify-center text-5xl animate-pulse">
              ☢️
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-rose-500 uppercase tracking-tighter italic">Neural Link Collapse</h2>
              <p className="text-slate-500 text-xs leading-relaxed uppercase font-bold">
                ระบบตรวจพบความผิดปกติในกระแสข้อมูล (Runtime Error). 
                Oracle ได้รับแจ้งเหตุการณ์นี้แล้วและกำลังดำเนินการกู้คืนสัญญาณ.
              </p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 overflow-hidden">
               <p className="text-[9px] text-rose-400/60 truncate italic">{this.state.error?.message}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black font-black text-xs rounded-2xl hover:bg-amber-50 active:scale-95 transition-all uppercase tracking-widest"
            >
              Re-align Neural Link
            </button>
          </div>
        </div>
      );
    }

    // Fix: Correctly accessing this.props to render children in the success path
    return this.props.children;
  }
}

export default ErrorBoundary;
