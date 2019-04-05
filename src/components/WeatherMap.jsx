import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { MetOClient } from '@fmidev/metoclient'
import { setState } from '../app/ActionCreators'

// Pure react component. Should not be connected to redux store; its container
// should be connected to the store.
export class WeatherMap extends React.Component {

  componentDidMount () {
  }

  componentDidUpdate () {
  }

  componentWillReceiveProps (nextProps) {
    if (this.metoclientDispatch) {
      this.metoclientDispatch = false;
      return;
    }
    if (nextProps.config != null) {
      let self = this
      let config
      let timeslider
      let rotated = false
      let stepButton
      try {
        config = JSON.parse(nextProps.config)
        config.project = 'project-' + nextProps.container
        config.container = nextProps.container
        config.layerSwitcherContainer = 'fmi-metoclient-layer-switcher-' + nextProps.container
        config.legendContainer = 'fmi-metoclient-legend-' + nextProps.container
        config.spinnerContainer = 'fmi-metoclient-spinner-' + nextProps.container
        config.timeSliderContainer = 'fmi-metoclient-timeslider fmi-metoclient-timeslider-' + nextProps.container

        timeslider = Array.from(document.getElementsByClassName('fmi-metoclient-timeslider-' + nextProps.container))
        if (timeslider.length > 0) {
          if (timeslider[0].classList.contains('rotated')) {
            rotated = true
          }
        }

        const closeMenu = () => {
          timeStepMenu.classList.remove('visible-menu')
        }
        this.metoclient = new MetOClient(config)
        this.metoclient.createAnimation({
          init: function () {
            if (rotated) {
              Array.from(document.getElementsByClassName('fmi-metoclient-timeslider-' + nextProps.container)).forEach(timeslider => {
                timeslider.classList.add('rotated')
              })
            }
          }
        })



      } catch (e) {
      }

      if (this.context.store.getState().get(this.props.id + '-mapConfig') !== config) {
        this.metoclientDispatch = true
        this.context.store.dispatch(setState({
          [this.props.id + '-metoclient']: this.metoclient
        }))
      }
    }

    window.addEventListener("keydown", keydownHandler, false);
    window.addEventListener("keyup", keyupHandler, false);

    let windows
    if (window.windows === undefined) {
      windows = []
    } else {
      windows = window.windows
    }
    window.windows = windows
    window.windows.push(this.metoclient)

    function multiZoom(e) {
      e.preventDefault()
      e.stopPropagation()
      Array.prototype.forEach.call(window.windows, map => {
        if (e.deltaY < 0) {
          map.setZoom(map.mapController_.view_.viewOptions.zoom + 1)
        } else if (e.deltaY > 0) {
          map.setZoom(map.mapController_.view_.viewOptions.zoom - 1)
        }
      })
    }

    function keydownHandler(e){
      var keyCode = e.keyCode;
      if(keyCode == 17){
        this.addEventListener("wheel", multiZoom, true);
      } else if(keyCode == 32){
        e.preventDefault()
        e.stopPropagation()
        Array.prototype.forEach.call(this.windows, map => {
          map.setZoom(2)
          map.setCenter(2750000, 9000000)
        })
      }
    }

    function keyupHandler(e){
      var keyCode = e.keyCode;
      if(keyCode == 17){
        this.removeEventListener("wheel", multiZoom, true);
      }
    }
  }

  render () {
    return (
      <div>
        <div id={this.props.container} className={'map-container ' + __("en")}/>
      </div>
    )
  }
}

WeatherMap.PropTypes = {
  config: PropTypes.object.isRequired,
  metoclient: PropTypes.object.isRequired
}

WeatherMap.contextTypes = {
  store: PropTypes.object.isRequired
}

function mapStateToProps (state, ownProps) {
  return {
    config: state.get(ownProps.id + '-mapConfig'),
    metoclient: state.get(ownProps.id + '-metoclient')
  }
}

export const WeatherMapContainer = connect(mapStateToProps)(WeatherMap)
