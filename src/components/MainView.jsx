/**
 * Application entry point
 */

// Load application styles
import '../styles/home.less'
import '../styles/base.less'
import '../styles/map.less'
import '../styles/timeSlider.less'
import '../styles/timeSliderRotated.less'

// React & component imports
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { combineReducers } from 'redux'
import { connect } from 'react-redux'

import { Layout } from 'metoclient-layout'
import 'metoclient-layout/dist/layout.css'
import goldenLayoutReducer from 'metoclient-layout/src/reducer.js'

import Sidebar from './Sidebar.jsx'
import sidebarReducer from '../app/sidebarReducer.js'

const metwebReducer = combineReducers({sidebarReducer, goldenLayoutReducer})
let store = createStore(metwebReducer)

class MainView extends React.Component{

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.createWorkspace()
  }

  /* Temporary jQuery hack */
  componentDidUpdate() {
    var currentState = store.getState().sidebarReducer;
    var selectedWorkspaceIndex = currentState.selectedWorkspace;
    currentState.workspaces.forEach((workspace, workspaceIndex) => {
      var workspaceElement = $('#fmi-metweb-windows' + (workspaceIndex + 1))
      if(workspaceIndex == currentState.selectedWorkspace){
        workspaceElement.show();
      } else{
        workspaceElement.hide()
      }
    })
  }

  createWorkspace () {

    var workspaceIndex = store.getState().sidebarReducer.workspaces.length
    var workspaceId = (workspaceIndex + 1).toString()
    var containerId = 'fmi-metweb-windows' + workspaceId
    var newWorkspaceContainer = document.createElement('div')
    newWorkspaceContainer.id = containerId
    newWorkspaceContainer.dataset.workspaceId = workspaceId
    newWorkspaceContainer.classList.add('workspace-container')

    var baseWorkspaceContainer = document.getElementById('fmi-metweb-windows')
    baseWorkspaceContainer.appendChild(newWorkspaceContainer)

    let workspace = new Layout(containerId)

      .onSelectionChanged(function(id){
        // Dispatch action to update Sidebar
        // 0ms  timeout to wait for goldenLayout updates
        setTimeout(function(){ this.props.changeWindow() }.bind(this), 0)
      }.bind(this))

      /* More available methods */
      .onWindowCreated(function (id) { })
      .onBookmarkAdded(function (id) { })
      .onDestroyed(function (id) { })
      .create('Työpöytä ' + workspaceId)

    this.props.addWorkspace(workspace, workspaceIndex)
    this.selectWorkspace(workspaceIndex)

  }

  selectWorkspace (workspaceIndex) {
    this.props.selectWorkSpace(workspaceIndex)
    // 100ms timeout to wait for goldenLayout updates
    setTimeout(function(){ this.props.changeWindow() }.bind(this), 100)
  }

  render(){

    var workspaceNav = []
    var currentState = store.getState().sidebarReducer; // TODO ditch

    store.getState().sidebarReducer.workspaces.forEach((workspace, workspaceIndex) => {
      workspaceNav.push(
        <div key={"w"+workspaceIndex} className={"fmi-metweb-footer-workspace-icon "+(currentState.selectedWorkspace == workspaceIndex ? "selected" : "")} onClick={this.selectWorkspace.bind(this, workspaceIndex)}></div>
      )
    })


    return (
      <div id="fmi-metweb-sidebar-windows-and-footer">

        <Sidebar open={false} />

      	<div id="fmi-metweb-windows-and-footer">

      		<div id="fmi-metweb-windows">
      		</div>

      		<div id="fmi-metweb-footer">
      			<div id="fmi-metweb-footer-empty">
      			</div>

      			<div id="fmi-metweb-footer-workspaces">
              {workspaceNav}
      			</div>

      			<div id="fmi-metweb-footer-new-workspace" onClick={this.createWorkspace.bind(this)}>
      			</div>

      		</div>

      	</div>
      </div>
    )
  }

}


/* MainView functionality */

const mapStateToProps = (state) => {
  return {
    workspaces: state.sidebarReducer.workspaces,
    selectedWorkspace: state.sidebarReducer.selectedWorkspace
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addWorkspace: (workspace, workspaceIndex) => {
      dispatch({type: "NEW_WORKSPACE", workspace: workspace, index: workspaceIndex})
    },
    selectWorkSpace: (workspaceIndex) => {
      dispatch({type: "CHANGE_SIDEBAR_TARGET", index: workspaceIndex})
    },
    changeWindow: () => {
      dispatch({type: "CHANGE_WINDOW_SELECTION"})
    }
  }
}

const MetWeb = connect(
  mapStateToProps,
  mapDispatchToProps
)(MainView)

ReactDOM.render(<Provider store={store}><MetWeb /></Provider>, document.getElementById("fmi-metweb-react-app-container"));
