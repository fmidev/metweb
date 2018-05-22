import axios from 'axios'

export function authorize(user) {
  // POST /authorize
  return (dispatch) => {
    return axios.post(USERAPI+'/authorize', {
      user: user
    })
    .then((response) => dispatch({
      type: 'AUTHORIZED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err
    }))
  }
}

export function loadSession(user){
  // GET /session
  return (dispatch) => {
    return axios.get(USERAPI+'/session', {
      user: user
    })
    .then((response) => dispatch({
      type: 'SESSION_LOADED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err
    }))
  }
}

export function saveSession(user, session){
  // POST /session
  return (dispatch) => {
    return axios.post(USERAPI+'/session', {
      user: state.user,
      sessionData: {}
    })
    .then((response) => dispatch({
      type: 'SESSION_SAVED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err
    }))
  }
}