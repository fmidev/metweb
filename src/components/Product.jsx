
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'

/* Single product */
export class Product extends React.Component{

  constructor(props) {
    super(props);
    /*this.hide = this.hide.bind(this);
    this.props.hideProduct(this.hide)
    this.show = this.show.bind(this);
    this.props.showProduct(this.show)*/
  }

  // Toggle value and pass the resulting value up the hierarchy
  handleChange() {
    this.props.toggle();
  };
/*
  hide(menuIndex, itemIndex) {
    this.props.hide(menuIndex, itemIndex)
  }

  show(menuIndex, itemIndex) {
    this.props.show(menuIndex, itemIndex)
  }
*/

  render(){

    return(

      <div className={"fmi-metweb-productgroup-product "+(this.props.hidden ? "hidden" : "")}>
        <div className="fmi-metweb-product-title">{this.props.product.title}</div>
        <label className="fmi-metweb-switch">
          <input type="checkbox" checked={this.props.active ? this.props.active : false} onChange={this.handleChange.bind(this)} /><span className="fmi-metweb-slider"></span>
        </label>
      </div>

    )

  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    active: state.sidebarReducer.menu.menu[ownProps.menuIndex].items[ownProps.itemIndex].active,
    hidden: state.sidebarReducer.menu.menu[ownProps.menuIndex].items[ownProps.itemIndex].hidden
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggle: () => {
      if(ownProps.product.active){
        dispatch({ type: "PRODUCT_OFF", menuIndex: ownProps.menuIndex, itemIndex: ownProps.itemIndex })
      }else{
        dispatch({ type: "PRODUCT_ON", menuIndex: ownProps.menuIndex, itemIndex: ownProps.itemIndex })
      }
    },/*
    hide: (menuIndex, itemIndex) => {
      console.log("product", ownProps)
      dispatch({type: "PRODUCT_HIDE", menuIndex: menuIndex, itemIndex: itemIndex})
    },
    show: (menuIndex, itemIndex) => {
      dispatch({type: "PRODUCT_SHOW", menuIndex: menuIndex, itemIndex: itemIndex})
    }*/
  }
}

Product = connect(
  mapStateToProps,
  mapDispatchToProps
)(Product)

export default Product
