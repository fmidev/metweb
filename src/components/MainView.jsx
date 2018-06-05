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
import { Provider, connect } from 'react-redux'

import { Layout } from 'metoclient-layout'
import 'metoclient-layout/dist/layout.css'

import UserInfo from './UserInfo.jsx'
import Sidebar from './Sidebar.jsx'
import MenuReader from '../app/MenuReader.js'
import { getApiKey } from '../app/coreFunctions.js'
import mainStore from '../app/mainStore.js'
import { authorize, loadSession, saveSession } from '../app/asyncActions.js'
import { version } from '../../package.json'

class MainView extends React.Component{

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.createWorkspace()
    this.props.initializeMenu()
    this.props.loadUserFromBasicAuth()
  }

  /* Temporary jQuery hack */
  componentDidUpdate() {
    var currentState = mainStore.metStore.getState().sidebarReducer;
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

    var workspaceIndex = mainStore.metStore.getState().sidebarReducer.workspaces.length
    var workspaceId = (workspaceIndex + 1).toString()
    var containerId = 'fmi-metweb-windows' + workspaceId
    var newWorkspaceContainer = document.createElement('div')
    newWorkspaceContainer.id = containerId
    newWorkspaceContainer.dataset.workspaceId = workspaceId
    newWorkspaceContainer.classList.add('workspace-container')

    var baseWorkspaceContainer = document.getElementById('fmi-metweb-windows')
    baseWorkspaceContainer.appendChild(newWorkspaceContainer)
    document.getElementById("version").innerHTML = version;

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
    var currentState = mainStore.metStore.getState().sidebarReducer; // TODO ditch

    mainStore.metStore.getState().sidebarReducer.workspaces.forEach((workspace, workspaceIndex) => {
      workspaceNav.push(
        <div key={"w"+workspaceIndex} className={"fmi-metweb-footer-workspace-icon "+(currentState.selectedWorkspace == workspaceIndex ? "selected" : "")} onClick={this.selectWorkspace.bind(this, workspaceIndex)}></div>
      )
    })

    this.props.saveSession(this.props.workspaces)

    return (

      <div id="fmi-metweb-react-app-container">

        <div id="fmi-metweb-header">

          <div id="fmi-metweb-header-title">
            MetWeb <span id="version"></span>  <a href="https://github.com/fmidev/metweb/releases"><img id="link" src="img/link.png"></img></a>
          </div>
          <div id="fmi-metweb-header-other">
          </div>
          <UserInfo />

        </div>

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

      </div>

    )
  }

}


/* MainView functionality */

const mapStateToProps = (state) => {
  return {
    workspaces: state.sidebarReducer.workspaces,
    selectedWorkspace: state.sidebarReducer.selectedWorkspace,
    errors: state.mainReducer.errors,
    gotContentInSomeWindow: state.sidebarReducer.worthwhile
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveSession: (workspaces) => {
      dispatch(saveSession(workspaces))
    },
    initializeMenu: () => {
      MenuReader.setMenuJson(getApiKey(), function(){
        dispatch({type: "MENU_UPDATED"})
      })
    },
    loadUserFromBasicAuth: () => {
      dispatch({type: "LOG_IN"})
      dispatch(authorize())
    },
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

ReactDOM.render(<Provider store={mainStore.metStore}><MetWeb /></Provider>, document.getElementById("fmi-metweb-entry"));
