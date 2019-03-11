import PropTypes from 'prop-types'
import React from 'react'

class EditableTitle extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: null, editing: false}
  }

  handleKeyPress(e) {
    if (e.key == 'Enter'){
      this.setState({value: null, editing: false})
      this.props.onChange(this.state.value)
    }
    else if (e.key == 'Escape') {
      this.setState({value: null, editing: false})
    }
  }

  handleBlur() {
    this.setState({value: null, editing: false})
    this.props.onChange(this.state.value)
  }

  render() {
    return (this.state.editing ? <input value={this.state.value}
                                        autoFocus
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => this.setState({value: e.target.value})}
                                        onKeyDown={(e) => this.handleKeyPress(e)}
                                        onBlur={() => this.handleBlur()}>
      </input> :
      <span onClick={() =>
        this.setState({value: this.props.title, editing: true})}>
      {this.props.title}
      </span>)
  }
}

EditableTitle.PropTypes = {
  title: PropTypes.func.isRequired
}

export default EditableTitle
