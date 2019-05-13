
import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { ProductList } from './ProductList.jsx'
import { Search } from './Search.jsx'

class Sidebar extends React.Component{

  constructor(props) {
    super(props);
  }

  handleClick(){
    this.props.toggle();
  }

  render(){

    if(this.props.menu.menu){
      this.props.menu.menu.forEach((productList, index) => {
        if(productList.items && productList.title){
          productList.items.forEach((product, index) => {
            if(!product.source){
              product.source = this.props.menu.source[0].name
            }
          });
          if (this.props.productLists.length == index) {
            this.props.productLists.push(<ProductList key={'pl'+index} hideProductList={h => this.hideProductList = h} showProductList={s => this.showProductList = s} menuIndex={index} title={productList.title ? productList.title : "Untitled"} products={productList.items} />)
          }
        }
      });
    }
    return (
      <div id="fmi-metweb-sidebar" className={this.props.open ? "open" : ""}>
        <div id="fmi-metweb-sidebar-toggle" onClick={this.handleClick.bind(this)}>
        </div>

        <div id="fmi-metweb-sidebar-menu">

          <div id="fmi-metweb-sidebar-menu-title">{__("Product list")}</div>
            <Search/>
          <div id="fmi-metweb-productgroup-container">
             {this.props.productLists}
          </div>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    open: state.sidebarReducer.open,
    menu: state.sidebarReducer.menu,
    productLists: state.sidebarReducer.productLists
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggle: () => {
      dispatch({type: "TOGGLE_SIDEBAR"})
    }
  }
}

Sidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar)

export default Sidebar
