
import React from 'react';
import ReactDOM from 'react-dom';

/* Single product */
export class Product extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      active: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({active: nextProps.product.active})
  }

  // Toggle value and pass the resulting value up the hierarchy
  toggleActive() {
    const currentState = this.state.active;
    this.setState({ active: !currentState }, function(){
      if (this.props.onChange) {
        this.props.onChange(this);
      }
    });

  };

  render(){

    return(

      <div className="fmi-metweb-productgroup-product">
        <div className="fmi-metweb-product-title">{this.props.product.title}</div>
        <label className="fmi-metweb-switch">
          <input type="checkbox" checked={this.state.active ? this.state.active : false} onChange={this.toggleActive.bind(this)} /><span className="fmi-metweb-slider"></span>
        </label>
      </div>

    )

  }

}

/* Group of products */
export class ProductList extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      products: false
    }
  }

  // The element will stay the same, but it will update when selected window changes
  componentWillReceiveProps(nextProps) {
    this.setState({products: nextProps.products})
  }

  toggleOpen() {
    var currentState = this.state.open;
    this.setState({ open: !currentState });
  };

  // Pass change/click event up the hierarchy
  passConfigChangeToSelectedWindow(product) {
    if(this.props.onChange){
      this.props.onChange(product)
    }
  }

  render(){

    var title = this.props.title;
    var products = [];

    if (this.state.products){
      this.state.products.forEach((product, index) => {
        products.push(
          <Product key={'p'+index} product={product} onChange={this.passConfigChangeToSelectedWindow.bind(this)} />
        )
      });
    }

    return (
      /* foreach menu */
      <div className={"fmi-metweb-productgroup "+(this.state.open ? "open" : "closed")}>
        <div className="fmi-metweb-productgroup-title" onClick={this.toggleOpen.bind(this)}>{title}<span className="fmi-metweb-product-count"></span></div>
        <div className="fmi-metweb-productgroup-list">
          {products}
        </div>
      </div>
    )

  }

}

export default ProductList
