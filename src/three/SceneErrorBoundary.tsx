import { Component, ReactNode } from 'react';
import { SceneFallback } from './SceneFallback';

interface Props {
  children: ReactNode;
  mouseX?: number;
  mouseY?: number;
  scrollProgress?: number;
}

interface State {
  hasError: boolean;
}

export class SceneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <SceneFallback
          mouseX={this.props.mouseX}
          mouseY={this.props.mouseY}
          scrollProgress={this.props.scrollProgress}
        />
      );
    }
    return this.props.children;
  }
}
