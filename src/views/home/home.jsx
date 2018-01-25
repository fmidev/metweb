/**
 * Application entry point
 */

// Load application styles
import './home.less'
import '../../styles/base.less'
import '../../styles/map.less'
import '../../styles/timeSlider.less'
import '../../styles/timeSliderRotated.less'

// React & component imports
import React from 'react'
import ReactDOM from 'react-dom'
import { Layout } from 'metoclient/apps/layout'
import 'metoclient/apps/layout/dist/layout.css'
import Sidebar from './Sidebar.jsx'

var workspaceCount = 0
var workspaces = {}

$(document).ready(function () {

  // TODO Footer component: $('#fmi-metweb-footer-new-workspace').on('click', createWorkspace)

  ReactDOM.render(<MainView />, document.getElementById("fmi-metweb-react-app-container"));

})

class MainView extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      selectedWorkspace: false
    };
  }

  componentDidMount() {
    $('#fmi-metweb-sidebar').on('click', toggleSidebar)
    this.createWorkspace()
  }

  createWorkspace () {
    workspaceCount++
    var baseId = 'fmi-metweb-windows'
    var workspaceIndex = workspaceCount.toString()
    var containerId = baseId + workspaceIndex
    var newWorkspaceContainer = document.createElement('div')
    newWorkspaceContainer.id = containerId
    newWorkspaceContainer.dataset.workspaceId = workspaceIndex
    newWorkspaceContainer.classList.add('workspace-container')
    var baseWorkspaceContainer = document.getElementById(baseId)
    this.selectWorkspaceByIndex()
    baseWorkspaceContainer.appendChild(newWorkspaceContainer)
    let workspace = new Layout(containerId)
    workspace.onWindowCreated(function (id) {

    }).onSelectionChanged(function(id){
      this.setState({selectedWorkspace: workspaces[workspaceIndex]})
    }.bind(this)).onBookmarkAdded(function (id) {

    }).onDestroyed(function (id) {

    }).create('Työpöytä ' + workspaceIndex)
    workspaces[workspaceIndex] = workspace
    this.selectWorkspaceByIndex(workspaceIndex)
  }

  selectWorkspaceByIndex (workspaceIndex) {
    if (workspaceIndex === undefined) {
      workspaceIndex = null
    }
    this.setState({selectedWorkspace: workspaces[workspaceIndex]})
  }

  render(){
    return (
      <div id="fmi-metweb-sidebar-windows-and-footer">
        <div id="fmi-metweb-sidebar">
      	</div>

      	<div id="fmi-metweb-sidebar-menu">

          <div id="fmi-metweb-sidebar-menu-title">
      		{"Tuotevalikko"}
      		</div>

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
      	     <Sidebar windows={this.state.selectedWorkspace} />
      		</div>

      	</div>

      	<div id="fmi-metweb-windows-and-footer">

      		<div id="fmi-metweb-windows">
      		</div>

      		<div id="fmi-metweb-footer">
      			<div id="fmi-metweb-footer-empty">
      			</div>

      			<div id="fmi-metweb-footer-workspaces">
      			</div>

      			<div id="fmi-metweb-footer-new-workspace">
      			</div>

      		</div>

      	</div>
      </div>
    )
  }

}

function toggleSidebar () {
  if ($('#fmi-metweb-sidebar-menu').is(':visible')) {
    $('#fmi-metweb-sidebar').removeClass('open')
    $('#fmi-metweb-sidebar-menu').css('display', 'none')
    $('#fmi-metweb-windows-and-footer').css('width', 'calc(100vw - 50px)')
  } else {
    $('#fmi-metweb-sidebar').addClass('open')
    $('#fmi-metweb-sidebar-menu').css('display', 'flex')
    $('#fmi-metweb-windows-and-footer').css('width', 'calc(100vw - 320px)')
  }
}
