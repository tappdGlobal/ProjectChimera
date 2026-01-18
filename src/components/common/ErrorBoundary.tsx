import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            {this.state.errorInfo && (
              <ScrollView style={styles.stackTrace}>
                <Text style={styles.stackTraceText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </ScrollView>
            )}
            <Text style={styles.hint}>
              Check the browser console for more details
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    maxWidth: '100%',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  stackTrace: {
    maxHeight: 200,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  stackTraceText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
