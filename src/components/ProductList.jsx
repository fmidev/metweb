
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { Product } from './Product.jsx'

/* Group of products */
export class ProductList extends React.Component{

  constructor(props) {
    super(props);
    /*this.hide = this.hide.bind(this);
    this.props.hideProductList(this.hide)
    this.show = this.show.bind(this);
    this.props.showProductList(this.show)*/
  }

  componentWillMount() {
    this.products = []
    if (this.props.products){
      this.props.products.forEach((product, index) => {
          this.products.push(
            <Product key={this.props.menuIndex+'p'+index} hideProduct={h => this.hideProduct = h} showProduct={s => this.showProduct = s} menuIndex={this.props.menuIndex} itemIndex={index} product={product} />
          )
      });
      this.props.pushToItemList(this.products)
    }
  }

  handleClick() {
    this.props.toggle()
  }
/*
  hide() {
    this.props.hide(menuIndex)
  }

  show(menuIndex) {
    this.props.show(menuIndex)
  }
*/
  render(){

    return (
      /* foreach menu */
      <div className={"fmi-metweb-productgroup "+(this.props.open ? "open " : "closed ")+(this.props.hidden ? "hidden" : "")}>
        <div className="fmi-metweb-productgroup-title" onClick={this.handleClick.bind(this)}>{this.props.title}<span className="fmi-metweb-product-count"></span></div>
        <div className="fmi-metweb-productgroup-list">
          {this.products}
        </div>
      </div>
    )

  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    open: state.sidebarReducer.menu.menu[ownProps.menuIndex].open,
    hidden: state.sidebarReducer.menu.menu[ownProps.menuIndex].hidden
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggle: () => {
      dispatch({type: "TOGGLE_PRODUCTLIST", menuIndex: ownProps.menuIndex})
    },/*
    hide: (menuIndex) => {
      dispatch({type: "HIDE_PRODUCTLIST", menuIndex: menuIndex})
    },
    show: (menuIndex) => {
      dispatch({type: "SHOW_PRODUCTLIST", menuIndex: menuIndex})
    },*/
    pushToItemList: (products) => {
      dispatch({type: "FILL_ITEMLIST", products: products})
    }
  }
}

ProductList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList)

export default ProductList
