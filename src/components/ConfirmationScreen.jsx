import React from 'react';
import '../styles/layout.css';

export class ConfirmationScreen extends React.Component {

  constructor(props) {
    super(props);
    this.handleConfirmation = this.handleConfirmation.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleConfirmation() {
    // Calculates if only 1 component is remaining, so it disables dragging
    let column = this.props.self.goldenLayout.root.contentItems[0]
    let rows = column.contentItems
    let sl = 0
    let x = 0
    while (x < rows.length) {
      sl += rows[x].contentItems.length
      x++
    }
    if (sl === 1) {
      this.props.self.goldenLayout.config.settings.reorderEnabled = false
    }

    // Actual removal of component
    this.props.tab.contentItem.remove()
    column = this.props.self.goldenLayout.root.contentItems[0]
    rows = column.contentItems

    let i = 1 // Blocks removal of last row --> layout hiararchy doesn't break
    while (i < rows.length) {
      if (rows[i].contentItems.length === 0) {
        rows[i].remove()
      }
      i++
    }
    // Allows removing the first row, if there are other rows present
    if(rows.length > 1){
      if(rows[1].contentItems.length !== null){
        if(rows[0].contentItems.length === 0) {
          rows[0].remove()
        }
      }
    }
    ReactDOM.unmountComponentAtNode(this.props.parent)
  }

  handleCancel() {
    ReactDOM.unmountComponentAtNode(this.props.parent)
    this.props.parent.parentNode.classList.remove("overlayed")
  }

  render() {
    return (
      <div className="confirmation_overlay">
        <div>
          <p className="confirmation_text">{__("Are you sure you want to delete the window")}</p>
          <div id="confirmation_button" className="fmi-metweb-filter-button" onClick={() => this.handleConfirmation()}>{__("Yes!")}</div>
          <div id="cancel_button" className="fmi-metweb-filter-button" onClick={() => this.handleCancel()}>{__("No!")}</div>
        </div>
      </div>

    )
  }
}

export default ConfirmationScreen;
