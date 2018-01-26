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

$(document).ready(function () {

  ReactDOM.render(<MainView />, document.getElementById("fmi-metweb-react-app-container"));

})

class MainView extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      workspaces: [],
      selectedWorkspace: false
    };
  }

  componentDidMount() {
    this.createWorkspace()
  }

  /* Temporary jQuery hack */
  componentDidUpdate() {
    this.state.workspaces.forEach((workspace, workspaceIndex) => {
      var workspaceElement = $('#fmi-metweb-windows' + (workspaceIndex + 1))
      if(workspaceIndex == this.state.selectedWorkspace){
        workspaceElement.show();
      } else{
        workspaceElement.hide()
      }
    })
  }

  createWorkspace () {

    var workspaceIndex = this.state.workspaces.length
    var workspaceId = (workspaceIndex + 1).toString()
    var containerId = 'fmi-metweb-windows' + workspaceId
    var newWorkspaceContainer = document.createElement('div')
    newWorkspaceContainer.id = containerId
    newWorkspaceContainer.dataset.workspaceId = workspaceId
    newWorkspaceContainer.classList.add('workspace-container')

    var baseWorkspaceContainer = document.getElementById('fmi-metweb-windows')
    baseWorkspaceContainer.appendChild(newWorkspaceContainer)

    let workspace = new Layout(containerId)

      /* Force update so Sidebar also updates */
      .onSelectionChanged(function(id){
        //setTimeout(function(){ this.forceUpdate() }.bind(this), 200);
        this.forceUpdate()
      }.bind(this))

      /* More available methods */
      .onWindowCreated(function (id) { })
      .onBookmarkAdded(function (id) { })
      .onDestroyed(function (id) { })
      .create('Työpöytä ' + workspaceId)

    this.state.workspaces[workspaceIndex] = workspace
    this.selectWorkspaceByIndex(workspaceIndex)
  }

  selectWorkspaceByIndex (workspaceIndex) {
    if (workspaceIndex === undefined) {
      workspaceIndex = null
    }
    this.setState({selectedWorkspace: workspaceIndex})
  }

  render(){

    var workspaces = [];
    var workspaceNav = [];

    this.state.workspaces.forEach((workspace, workspaceIndex) => {

      workspaceNav.push(
        <div key={"w"+workspaceIndex} className={"fmi-metweb-footer-workspace-icon "+(this.state.selectedWorkspace == workspaceIndex ? "selected" : "")} onClick={this.selectWorkspaceByIndex.bind(this, workspaceIndex)}></div>
      )
    })


    return (
      <div id="fmi-metweb-sidebar-windows-and-footer">

        <Sidebar windows={this.state.workspaces[this.state.selectedWorkspace]} />

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
