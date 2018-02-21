
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'

/* Single product */
export class Product extends React.Component{

  constructor(props) {
    super(props);
  }

  // Toggle value and pass the resulting value up the hierarchy
  handleChange() {
    this.props.toggle();
  };

  render(){

    return(

      <div className="fmi-metweb-productgroup-product">
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
    active: state.sidebarReducer.menu.menu[ownProps.menuIndex].items[ownProps.itemIndex].active
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
    }
  }
}

Product = connect(
  mapStateToProps,
  mapDispatchToProps
)(Product)

export default Product
