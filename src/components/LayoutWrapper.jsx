import GoldenLayout from './Layout.jsx'
import DotsMenu from "./DotsMenu.jsx"
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import goldenReducer from '../app/goldenReducer.js'
import { setState } from '../app/ActionCreators'
import extend from 'extend'
import 'typeface-roboto'
import '../styles/layout.css'
import React from "react"
import EditableTitle from "./EditableTitle.jsx"

const store = createStore(goldenReducer)

store.dispatch(setState({
  'count': 10
}))


class Layout {
  constructor (id) {
    this.containerId = (id != null) ? id : null
    this.golden = {
      goldenLayout: {
        fmi: {}
      }
    }
  }
  create (title) {
    let container = document.getElementById(this.containerId)
    let customFmi = this.golden.goldenLayout.fmi
    this.title = title
    ReactDOM.render(
      <div>
        <div>
          {this.createHeader()}
          <Provider store={store}>
            <GoldenLayout ref={wrapper => { this.golden = wrapper }} containerId={this.containerId}/>
          </Provider>
        </div>
      </div>,
      container
    )
    this.golden.goldenLayout.fmi = customFmi

    return this
  }

  createHeader () {
    const menuItems = [{
      title: __("Add new sub window"),
      callback: () => {
        // Calculates if layout already has components before adding new one, so it allows dragging
        let layout = this.golden.goldenLayout
        let column = layout.root.contentItems[0]
        let rows = column.contentItems
        let rl = rows.length
        let sl = 0
        let x = 0
        while (x < rows.length) {
          sl += rows[x].contentItems.length
          x++
        }
        if (sl > 0) {
          layout.config.settings.reorderEnabled = true
        }

        // Actually adding the component
        let maxRowIndex = rows.length - 1
        let maxNumRowItems = 2
        for (let i = 0; i < maxRowIndex; i++) {
          if (!rows[i].isRow) {
            continue
          }
          let numRowItems = rows[i].contentItems.length
          if (numRowItems > maxNumRowItems) {
            maxNumRowItems = numRowItems
          }
        }
        let numWindowsCreated = store.getState().get(this.containerId + '-numWindowsCreated')
        let id = numWindowsCreated.toString()
        let title = __("Window") + " " + (numWindowsCreated + 1).toString()
        let newItemConfig = {
          type: 'react-component',
          component: 'WeatherMapContainer',
          title: title,
          isClosable: false,
          index: numWindowsCreated,
          props: {
            id: this.containerId + '-' + id,
            container: this.containerId + '-map-container-' + id
          },
          componentState: {
            config: {
              layers: {}
            },
            callbacks: {
              init: function() {},
              timeSliderCreated: function() {},
              toolClicked: function() {}
            }
          },
      }
        if (rows[maxRowIndex].contentItems.length < maxNumRowItems) {
          rows[maxRowIndex].addChild(newItemConfig)
        } else {
          column.addChild({
            type: 'row',
            isClosable: false,
            content: [newItemConfig]
          })
        }
      }
    }, {
      title: __("Add to favorites"),
      callback: () => {
      }
    }, {
      title: __("Close view"),
      callback: () => {
        let background = document.getElementById("fmi-metweb-windows")
        let confirmation = document.createElement("div")
        confirmation.classList = "confirmation_overlay"

        let wrapper = document.createElement("div")
        let confirmation_text = document.createElement("p")
        confirmation_text.classList = "confirmation_text"
        confirmation_text.innerHTML = __("Are you sure you want to delete the view")

        let confirmation_button = document.createElement("div")
        confirmation_button.innerHTML = __("Yes!")
        confirmation_button.classList = "fmi-metweb-filter-button"
        confirmation_button.addEventListener('click', () => {
          this.golden.goldenLayout.destroy()
          let container = document.getElementById(this.containerId)
          let id = container.dataset.workspaceId
          while (container.firstChild) {
            container.removeChild(container.firstChild)
          }
          this.golden.goldenLayout.fmi.destroyed(id)
          this.golden = null

          confirmation.parentNode.removeChild(confirmation)
        })

        let back_button = document.createElement("div")
        back_button.innerHTML = __("No!")
        back_button.classList = "fmi-metweb-filter-button"
        back_button.addEventListener('click', () => {
          confirmation.parentNode.removeChild(confirmation)
        })

        wrapper.appendChild(confirmation_text)
        wrapper.appendChild(confirmation_button)
        wrapper.appendChild(back_button)
        confirmation.appendChild(wrapper)
        background.prepend(confirmation)
      }
    }]
    return (
      <header>
        <EditableTitle title={this.title}
                       onChange={val => this.create(val)}/>
        <DotsMenu id={'menu-dots-' + this.containerId}
                  items={menuItems}
        />
      </header>
    )
  }

  getNumWindows () {
    return store.getState().get(this.containerId + '-numWindowsCreated')
  }

  push (config) {
    store.dispatch(setState({
      [this.containerId + '-' + this.getNumWindows() + '-mapConfig']: JSON.stringify(config)
    }))
    return this
  }

  get (index) {
    let id = this.containerId + '-' + index.toString() + '-mapConfig'
    let data = store.getState().get(id)
    if (data != null) {
      return JSON.parse(data)
    }
    return null
  }

  set (index, config) {
    if (index != null) {
      store.dispatch(setState({
        [this.containerId + '-' + index.toString() + '-mapConfig']: JSON.stringify(config)
      }))
    }
    return this
  }

  update (index, userConfig) {
    if (index != null) {
      let config = this.get(index)
      if (config == null) {
        config = {}
      }
      extend(true, config, userConfig)
      store.dispatch(setState({
        [this.containerId + '-' + index.toString() + '-mapConfig']: JSON.stringify(config)
      }))
      return this
    }
  }

  select (itemId) {
    if (itemId != null) {
      let item = this.findItemById(itemId)
      this.golden.goldenLayout.selectItem(item)
    }
    return this
  }

  findItemById (itemId) {
    let contentItems = this.golden.goldenLayout.root.contentItems
    let numContentItems = contentItems.length
    for (let i = 0; i < numContentItems; i++) {
      let items = contentItems[i].getItemsById(itemId)
      if (items.length > 0) {
        return items[0]
      }
    }
    return null
  }

  onSelectionChanged (callback) {
    if (typeof callback === 'function') {
      this.golden.goldenLayout.fmi.selectionChanged = callback
    }
    return this
  }

  onWindowCreated (callback) {
    if (typeof callback === 'function') {
      this.golden.goldenLayout.fmi.windowCreated = callback
    }
    return this
  }

  onBookmarkAdded (callback) {
    if (typeof callback === 'function') {
      this.golden.goldenLayout.fmi.bookmarkAdded = callback
    }
    return this
  }

  onDestroyed (callback) {
    if (typeof callback === 'function') {
      this.golden.goldenLayout.fmi.destroyed = callback
    }
    return this
  }

  getSelected () {
    let selectedId = store.getState().get(this.containerId + '-selected')
    let item = this.findItemById(selectedId)
    return item.config.index
  }

  unset (index) {
    store.dispatch(setState({
      [this.containerId + '-' + this.getNumWindows() + '-mapConfig']: null
    }))
    return this
  }

  getMetOClient (index) {
    let id = this.containerId + '-' + index.toString() + '-metoclient'
    let data = store.getState().get(id)
    return data
  }

  setContainer (id) {
    this.containerId = id
    return this
  }
}

export default Layout
