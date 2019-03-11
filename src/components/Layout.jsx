import { FMIGoldenLayout } from 'metoclient-goldenlayout';
import React from 'react';
import { Provider } from 'react-redux'
//import { MetOClient } from '@fmidev/metoclient'
import { MetOClient } from '../../../metoclient'
import { createMenu } from '../../../metoclient/src/utils'
import { setState } from '../app/ActionCreators.js'
import { WeatherMapContainer } from './WeatherMap.jsx'
import EditableTitle from './EditableTitle.jsx'
import ConfirmationScreen from './ConfirmationScreen.jsx'
import elementResizeDetectorMaker from 'element-resize-detector'


class GoldenLayout extends React.Component {
  constructor(props) {
    super(props)
    this.setNode = this.setNode.bind(this)
    this.goldenLayout = null
  }
  componentDidMount() {
    let self = this;
    self.context.store.dispatch(setState({
      [self.props.containerId + '-numWindowsCreated']: 0
    }))
    window.metoclient = MetOClient

    var metoclientConfig = {
      layers: {}
    }

    var config = {
      settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: true,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false
      },
      dimensions: {
        borderWidth: 10,
        minItemHeight: 10,
        minItemWidth: 10,
        headerHeight: 40,
        dragProxyWidth: 300,
        dragProxyHeight: 200
      },
      labels: {
        close: 'close',
        maximise: 'maximise',
        minimise: 'minimise',
        popout: 'open in new window'
      },
      content: [{
        type: 'column',
        isClosable: false,
        content: [{
          type: 'row',
          isClosable: false,
          content: [{
            type: 'react-component',
            component: 'WeatherMapContainer',
            title: __("Window") + ' 1',
            isClosable: false,
            index: 0,
            props: {
              id: this.props.containerId + '-0',
              container: this.props.containerId + '-map-container-0'
            },
            componentState: {
              config: metoclientConfig,
              callbacks: {
                init: function() {},
                timeSliderCreated: function() {},
                toolClicked: function() {}
              }
            },
          }]
        }]
      }]
    }


    function wrapComponent (Component, store) {
      class Wrapped extends React.Component {
        render () {
          return (
            <Provider store={store}>
              <Component {...this.props} />
            </Provider>
          )
        }
      }

      return Wrapped
    }

    /* you can pass config as prop, or use a predefined one */
    this.goldenLayout = new FMIGoldenLayout(config, this.node);

    /* register components or bind events to your new instance here */

    this.goldenLayout.fmi = {
      selectionChanged: () => {},
      windowCreated: () => {},
      bookmarkAdded: () => {},
      destroyed: () => {}
    }

    this.goldenLayout.on('itemCreated', function (item) {
      if (item.config.type === 'component') {
        let id = item.config.props.id
        item.addId(id)
        item.parent.select()
        if (id === self.context.store.getState().get(self.props.containerId + '-selected')) {
          self.goldenLayout.selectItem(item.parent)
        }
        // Todo: increment function
        let stateKey = self.props.containerId + '-numWindowsCreated'
        let numWindowsCreated = self.context.store.getState().get(stateKey)
        self.context.store.dispatch(setState({
          [stateKey]: numWindowsCreated + 1
        }))
      }
    })

    this.goldenLayout.on('tabCreated', (tab) => {
      let id = tab.contentItem.config.props.id
      if ((id != null) && (id === self.context.store.getState().get(self.props.containerId + '-selected'))) {
        self.goldenLayout.selectItem(tab.contentItem.parent)
      }

      tab.element[0].addEventListener('mousedown', (e) => {
        self.goldenLayout.selectItem(tab.contentItem.parent)
      })

      const makeTitleEditable = () => {
        const elem = tab.titleElement.get(0);
        ReactDOM.render(
          <EditableTitle
            title={tab.contentItem.config.title}
            onChange={(title) => {
              ReactDOM.unmountComponentAtNode(elem);
              tab.contentItem.setTitle(title);
            }}
          />,
          elem
        );
      }
      makeTitleEditable();
      tab.contentItem.on('titleChanged', makeTitleEditable);

      let dots = document.createElement('div')
      dots.classList.add('menu-dots')
      dots.classList.add('light-theme')

      const closeMenu = () => {
        windowMenu.classList.remove('visible-menu')
        dots.classList.remove('hover')
      }

      const windowMenu = createMenu({
        id: 'menu-dots-' + id,
        items: [{
          title: __("Show fullscreen"),
          callback: () => {
            let selected_item = document.getElementsByClassName('lm_item lm_stack lm_selected')[0]
            selected_item.classList.toggle('lm_fullscreen')
            selected_item.childNodes[1].childNodes[0].childNodes[0].classList.toggle('lm_content_fullscreen')
            selected_item.childNodes[0].childNodes[1].childNodes[0].childNodes[0].classList.toggle('metoclient-menu-fullscreen')
            if (selected_item.classList.contains('lm_fullscreen')) {
              selected_item.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerHTML = '<a href=\"#\">' + __("Close fullscreen") + '</a>'
            } else {
              selected_item.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerHTML = '<a href=\"#\">' + __("Show fullscreen") + '</a>'
            }
            if (selected_item.classList.contains('lm_fullscreen')) {
              document.onkeydown = function(e){
                // Esc keycode = 27
                if(e.keyCode == "27") {
                  selected_item.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].click();
                }
              };
            } else {
              document.onkeydown = null
            }

            closeMenu()
          }
        }, {
          title: __("Timeslider: rotate"),
          callback: () => {
            let rotatedClass = 'rotated'
            let marginClass = 'margin-added'
            let subWindow = document.getElementById(tab.contentItem.config.props.container)
            Array.from(document.getElementsByClassName('fmi-metoclient-timeslider-' + tab.contentItem.config.props.container)).forEach(timeSlider => {
              if (timeSlider.classList.contains(rotatedClass)) {
                timeSlider.classList.remove(rotatedClass)
                subWindow.classList.remove(marginClass)
              } else {
                timeSlider.classList.add(rotatedClass)
                subWindow.classList.add(marginClass)
              }
            })
            closeMenu()
          }
        }, {
          title: __("Add to favorites"),
          callback: () => {
            closeMenu()
          }
        }, {
          title: __("Share window"),
          callback: () => {
            closeMenu()
          }
        }, {
          title: __("Delete window"),
          callback: () => {
            closeMenu()
            let background = this.node.getElementsByClassName("lm_selected")[0]
            background.classList.add("overlayed")

            // background has multiple child nodes, so we need helping container div to work as helper
            // otherwise when removing overlay, whole window would get emptied
            let container = document.createElement('div')
            background.append(container)
            ReactDOM.render(<ConfirmationScreen self={self} tab={tab} parent={container}/>, container)
          }
        }]
      })

      dots.appendChild(windowMenu)

      dots.addEventListener('mouseenter', (e) => {
        dots.classList.add('hover')
      })

      dots.addEventListener('mouseleave', (e) => {
        dots.classList.remove('hover')
        windowMenu.classList.remove('visible-menu')
      })

      dots.addEventListener('mousedown', (e) => {
        self.goldenLayout.selectItem(tab.contentItem.parent)
      })

      dots.addEventListener('mouseup', (e) => {
        self.goldenLayout.selectItem(tab.contentItem.parent)
        windowMenu.classList.add('visible-menu')
      })

      // Accessing the DOM element that contains the popout, maximise and * close icon
      tab.header.controlsContainer.prepend(dots)
      if(typeof self.goldenLayout.fmi.windowCreated == "function"){
        self.goldenLayout.fmi.windowCreated(id)
      }
    })

    this.goldenLayout.on('stackCreated', function (stack) {
      // Override to not drop tabs
      stack._$highlightDropZone = function (x, y) {
        let segment
        let area
        for (segment in this._contentAreaDimensions) {
          area = this._contentAreaDimensions[segment].hoverArea
          if ((area.x1 < x) && (area.x2 > x) && (area.y1 < y) && (area.y2 > y)) {
            if (segment !== 'header') {
              this._resetHeaderDropZone()
              this._highlightBodyDropZone(segment)
            }
            return
          }
        }
      }

      stack.childElementContainer[0].addEventListener('mousedown', function () {
        self.goldenLayout.selectItem(stack)
      })
    })

    this.goldenLayout.on('selectionChanged', function (selectedItem) {
      let selectedId = selectedItem.contentItems[0].config.id
      if (self.context.store.getState().get(self.props.containerId + '-selected') === selectedId) {
        return
      }
      self.context.store.dispatch(setState({
        [self.props.containerId + '-selected']: selectedId
      }))
      if(typeof self.goldenLayout.fmi.selectionChanged == "function"){
        self.goldenLayout.fmi.selectionChanged(selectedId)
      }
    })

    this.goldenLayout.registerComponent('WeatherMapContainer',
      wrapComponent(WeatherMapContainer, self.context.store)
    )

    this.goldenLayout.init()

    this.goldenLayout.on('initialised', function(){
      self.goldenLayout.config.settings.reorderEnabled = true
    })

    this.goldenLayout.on('itemDropped', (e) => {
      let column = self.goldenLayout.root.contentItems[0]
      let rows = column.contentItems
      let i = 1 // Blocks removal of last row --> layout hiararchy doesn't break
      while (i < rows.length) {
        if (rows[i].contentItems.length === 0) {
          rows[i].remove()
        }
        i++
      }
      // Allows removing the first row, if there are other rows present
      if(rows.length > 1){
        if(rows[1].contentItems.length !== null){
          if(rows[0].contentItems.length === 0) {
            rows[0].remove()
          }
        }
      }
    })

    const erd = elementResizeDetectorMaker()
    erd.listenTo(document.getElementById(self.props.containerId), (element) => {
      self.goldenLayout.updateSize()
    })
  }

  setNode(node) {
    this.node = node;
  }

  updateSize() {
    if (this.goldenLayout != null) {
      this.goldenLayout.updateSize()
    }
  }

  render() {
    return <div className='goldenLayout' ref={this.setNode} />;
  }
}

GoldenLayout.contextTypes = {
  store: React.PropTypes.object.isRequired
}

export default GoldenLayout
