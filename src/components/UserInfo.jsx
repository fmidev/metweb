
import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

class UserInfo extends React.Component{

  constructor(props) {
    super(props);
  }

  render(){

    return (
      <div id="fmi-metweb-header-user">
        {this.props.user.name}
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    user: {
      name: state.mainReducer.user.name,
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /* Nothing for now */
  }
}

UserInfo = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserInfo)

export default UserInfo
