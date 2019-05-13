
import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { ProductList } from './ProductList.jsx'
import { Product } from './Product.jsx'

export class Search extends React.Component{

  constructor(props) {
    super(props);
  }

  onSearch(){
    var searchTerm = this._reactInternalInstance._renderedComponent._renderedChildren[".1"]._renderedChildren[".0"]._hostNode.value
    for (let productList of this.props.productLists) {
      // The call should be productList.hideProductList so we would call the function from inside the component
      // Same for all show/hide functioncalls in this function
      this.props.hideProductList(productList.props.menuIndex)
    }
    let listsToShow = []
    for (let item of this.props.itemList) {
      if (item.props.product.title.toUpperCase().includes(searchTerm.toUpperCase())) {
        this.props.showProduct(item.props.menuIndex, item.props.itemIndex)
        if (!listsToShow.includes(item.props.menuIndex)) {
          listsToShow.push(item.props.menuIndex)
        }
      } else {
        this.props.hideProduct(item.props.menuIndex, item.props.itemIndex)
      }
    }
    for (let menuIndex of listsToShow) {
      this.props.showProductList(menuIndex)
    }
  }

  render(){
    return (
      <div id="fmi-metweb-sidebar-menu-filters">
        <div className="fmi-metweb-title">{__("Search")}</div><div className="fmi-metweb-wrappable-container">
          <input type="text" id="fmi-metweb-search" onInput={this.onSearch.bind(this)}></input>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    open: state.sidebarReducer.open,
    menu: state.sidebarReducer.menu,
    productLists: state.sidebarReducer.productLists,
    itemList: state.sidebarReducer.itemList
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    showProduct: (menuIndex, itemIndex) => {
      dispatch({type: "PRODUCT_SHOW", menuIndex: menuIndex, itemIndex: itemIndex})
    },
    hideProduct: (menuIndex, itemIndex) => {
      dispatch({type: "PRODUCT_HIDE", menuIndex: menuIndex, itemIndex: itemIndex})
    },
    showProductList: (menuIndex) => {
      dispatch({type: "SHOW_PRODUCTLIST", menuIndex: menuIndex})
    },
    hideProductList: (menuIndex) => {
      dispatch({type: "HIDE_PRODUCTLIST", menuIndex: menuIndex})
    }
  }
}

Search = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)

export default Search
