
import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { ProductList } from './ProductList.jsx'

class Sidebar extends React.Component{

  constructor(props) {
    super(props);

  }

  handleClick(){
    this.props.toggle();
  }

  render(){

    // Build an array of productLists
    var productLists = [];
    if(this.props.menu.menu){
      this.props.menu.menu.forEach((productList, index) => {
        if(productList.items && productList.title){
          productList.items.forEach((product, index) => {
            if(!product.source){
              product.source = this.props.menu.source[0].name
            }
          });
          if (productList.title == "Radar" || productList.title == "Satellite") {
            productLists.push(<ProductList key={'pl'+index} menuIndex={index} title={productList.title ? productList.title : "Untitled"} products={productList.items} />)
          }
        }
      });
    }
    return (
      <div id="fmi-metweb-sidebar" className={this.props.open ? "open" : ""}>
        <div id="fmi-metweb-sidebar-toggle" onClick={this.handleClick.bind(this)}>
        </div>

        <div id="fmi-metweb-sidebar-menu">

          <div id="fmi-metweb-sidebar-menu-title">{"Tuotevalikko"}</div>

          <div id="fmi-metweb-sidebar-menu-filters">
            <div className="fmi-metweb-title">{"Filtterit"}</div>

            <div className="fmi-metweb-wrappable-container">
              <div className="fmi-metweb-filter-button">{"Filtteri 1"}</div>
              <div className="fmi-metweb-filter-button">{"Filtteri 2"}</div>
              <div className="fmi-metweb-filter-button">{"Filtteri 3"}</div>
              <div className="fmi-metweb-filter-button">{"Filtteri 4"}</div>
            </div>
          </div>

          <div id="fmi-metweb-productgroup-container">
             {productLists}
          </div>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    open: state.sidebarReducer.open,
    menu: state.sidebarReducer.menu
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
