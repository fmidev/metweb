/**
 * Application entry point
 */

// Load application styles
import './home.less'
import '../../styles/base.less'
import '../../styles/map.less'
import '../../styles/timeSlider.less'
import '../../styles/timeSliderRotated.less'
import { Layout } from 'metoclient/apps/layout'
import 'metoclient/apps/layout/dist/layout.css'
import Sidebar from './Sidebar.jsx'

var workspaceIndex = 0
var workspaces = {}

$(document).ready(function () {

  $('#fmi-metweb-sidebar').on('click', toggleSidebar)
  $('.fmi-metweb-filter-button').on('click', toggleFilter)

  var getUrlParameter = function getUrlParameter (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=')

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1]
      }
    }
  }

  // The FMI API key can be set as a url parameter or in the Webpack
  // configuration file. See the placeholder in the file webpack.config.js.
  var apiKey = getUrlParameter('apikey')
  if (apiKey == null) {
    apiKey = APIKEY
  }

  createWorkspace()
  $('#fmi-metweb-footer-new-workspace').on('click', createWorkspace)

  Sidebar.updateProducts()
})

function createWorkspace () {
  workspaceIndex++
  var baseId = 'fmi-metweb-windows'
  var workspaceId = workspaceIndex.toString()
  var containerId = baseId + workspaceId
  var newWorkspaceContainer = document.createElement('div')
  newWorkspaceContainer.id = containerId
  newWorkspaceContainer.dataset.workspaceId = workspaceId
  newWorkspaceContainer.classList.add('workspace-container')
  var baseWorkspaceContainer = document.getElementById(baseId)
  selectWorkspace()
  baseWorkspaceContainer.appendChild(newWorkspaceContainer)
  let workspace = new Layout(containerId)
  workspace.onWindowCreated(function (id) {

  }).onSelectionChanged(function (id) {
    setTimeout($.proxy(Sidebar.updateActiveProducts, Sidebar), 500)
  }).onBookmarkAdded(function (id) {

  }).onDestroyed(function (id) {
      console.log('On destroyed: ' + id)
      var workspaceIcons = document.getElementsByClassName('fmi-metweb-footer-workspace-icon')
      var numWorkspaceIcons = workspaceIcons.length
      for (var i = 0; i < numWorkspaceIcons; i++) {
        if (workspaceIcons[i].dataset.workspaceId === id) {
          var newSelectedId
          if (numWorkspaceIcons > 1) {
            newSelectedId = workspaceIcons[(i === 0) ? 1 : i - 1].dataset.workspaceId
          }
          workspaceIcons[i].parentElement.removeChild(workspaceIcons[i])
          if (newSelectedId !== null) {
            selectWorkspace(newSelectedId)
          }
          break
        }
      }
    }).create('Työpöytä ' + workspaceId)
  workspaces[workspaceId] = workspace
  var newWorkspaceIcon = document.createElement('div')
  newWorkspaceIcon.classList.add('fmi-metweb-footer-workspace-icon')
  newWorkspaceIcon.dataset.workspaceId = workspaceId
  newWorkspaceIcon.addEventListener('click', () => {
    selectWorkspace(newWorkspaceIcon.dataset.workspaceId)
  })
  document.getElementById('fmi-metweb-footer-workspaces').appendChild(newWorkspaceIcon)
  selectWorkspace(workspaceId)
}

function selectWorkspace (workspaceId) {
  if (workspaceId === undefined) {
    workspaceId = null
  }
  var workspaceIcons = document.getElementsByClassName('fmi-metweb-footer-workspace-icon')
  var numWorkspaceIcons = workspaceIcons.length
  for (var i = 0; i < numWorkspaceIcons; i++) {
    if (workspaceIcons[i].dataset.workspaceId === workspaceId) {
      workspaceIcons[i].classList.add('selected')
    } else {
      workspaceIcons[i].classList.remove('selected')
    }
  }
  var workspaceContainers = document.getElementsByClassName('workspace-container')
  var numWorkspaceContainers = workspaceContainers.length
  for (var j = 0; j < numWorkspaceContainers; j++) {
    if (workspaceContainers[j].dataset.workspaceId === workspaceId) {
      workspaceContainers[j].style.display = 'inline'
    } else {
      workspaceContainers[j].style.display = 'none'
    }
  }
  Sidebar.setWindows(workspaces[workspaceId])
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

    Sidebar.updateActiveProducts()

  }
}

function toggleFilter () {
  if ($(this).hasClass('selected')) {
    $(this).removeClass('selected')
  } else {
    $(this).addClass('selected')
  }
}
