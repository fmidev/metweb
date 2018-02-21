
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { Product } from './Product.jsx'

/* Group of products */
export class ProductList extends React.Component{

  constructor(props) {
    super(props);
  }

  handleClick() {
    this.props.toggle()
  }

  render(){

    var title = this.props.title;
    var products = [];

    if (this.props.products){
      this.props.products.forEach((product, index) => {
        products.push(
          <Product key={this.props.plKey+'p'+index} menuIndex={this.props.menuIndex} itemIndex={index} product={product} />
        )
      });
    }

    return (
      /* foreach menu */
      <div className={"fmi-metweb-productgroup "+(this.props.open ? "open" : "closed")}>
        <div className="fmi-metweb-productgroup-title" onClick={this.handleClick.bind(this)}>{title}<span className="fmi-metweb-product-count"></span></div>
        <div className="fmi-metweb-productgroup-list">
          {products}
        </div>
      </div>
    )

  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    open: state.sidebarReducer.menu.menu[ownProps.menuIndex].open
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggle: () => {
      dispatch({type: "TOGGLE_PRODUCTLIST", menuIndex: ownProps.menuIndex})
    }
  }
}

ProductList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList)

export default ProductList
