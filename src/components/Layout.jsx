import { FMIGoldenLayout } from 'metoclient-goldenlayout';
import React from 'react';

class Layout extends React.PureComponent {
  constructor(props) {
    super(props)
    this.setNode = this.setNode.bind(this)
    this.goldenLayout = null
  }
  componentDidMount() {
    /* you can pass config as prop, or use a predefined one */
    this.goldenLayout = new FMIGoldenLayout(this.props.config, this.node);

    /* register components or bind events to your new instance here */
    this.goldenLayout.init();
  }
  setNode(node) {
    this.node = node;
  }

  updateSize() {
    this.goldenLayout.updateSize()
  }

  render() {
    return <div class="goldenLayout" ref={this.setNode} />;
  }
}

export default Layout
