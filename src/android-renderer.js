import React from 'react'
import {
  View,
  Text,
  TextInput,
  CheckBox,
  Picker,
} from 'react-native'

class Container extends React.Component {
  render() {
    return (
      <View>
        {this.props.children}
      </View>
    )
  }
}

class ParseError extends React.Component {
  render() {
    return (<Text>Error parsing config: {this.props.error}</Text>)
  }
}
class FormatError extends React.Component {
  render() {
    return (<Text>Content error in config: {this.props.error}</Text>)
  }
}

class FormTextDisplay extends React.Component {
  render() {
    return (<Text>{this.props.text}</Text>)
  }
}
class FormGroup extends React.Component {
  render() {
    return (<View>{this.props.children}</View>)
  }
}

class FormTextInput extends React.Component {
  render() {
    return (<TextInput />)
  }
}
class FormTextAreaInput extends React.Component {
  render() {
    return (<TextInput multiline={true} />)
  }
}
class FormCheckboxInput extends React.Component {
  render() {
    return (<CheckBox />)
  }
}
class FormSelectInput extends React.Component {
  render() {
    return (<Picker />)
  }
}

var AndroidRenderer = {
  container: Container,

  parseError: ParseError,
  formatError: FormatError,

  textDisplay: FormTextDisplay,
  group: FormGroup,

  text: FormTextInput,
  textarea: FormTextAreaInput,
  checkbox: FormCheckboxInput,
  select: FormSelectInput,
}

export default AndroidRenderer
