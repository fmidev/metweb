import React from 'react';
import PropTypes from 'prop-types';

class DotsMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hover: false, visible: false}
  }
  render() {
    let dotsClass = 'menu-dots light-theme'
    if (this.state.hover) dotsClass += ' hover'
    let menuClass = 'metoclient-menu'
    if (this.state.visible) menuClass += ' visible-menu'
    return (
      <div className={dotsClass}
           onMouseEnter={e => this.setState({hover: true})}
           onMouseLeave={e => this.setState({hover: false, visible: false})}
           onMouseUp={e => this.setState({visible: true})}>
        <ul id={'window-menu-dots-'+this.props.id} className={menuClass}>
          {this.props.items.map((item) => {
            return <li key={item.title}>
              <a href="#" onClick={(e) => {
                this.setState({hover: false, visible: false})
                item.callback()
              }}>{item.title}</a>
            </li>
          })}
        </ul>
      </div>
    )
  }
}

DotsMenu.PropTypes = {
  id: PropTypes.func.isRequired,
  items: PropTypes.func.isRequired
};

export default DotsMenu
