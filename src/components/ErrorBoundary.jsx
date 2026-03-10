import {Component} from 'react'
import ErrorPage from '@/pages/ErrorPage'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {hasError: false, error: null, errorInfo: null}
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error}
  }

  componentDidCatch(error, errorInfo) {
    this.setState({errorInfo})
  }

  handleReset() {
    this.setState({hasError: false, error: null, errorInfo: null})
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}
