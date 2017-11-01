import React from 'react'
import {
  View,
  Text,
  TextInput,
  CheckBox,
  Picker,
  TouchableOpacity,
} from 'react-native'
// import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'

import { prettify } from './utils'

class Container extends React.Component {
  render() {
    return (
      <View style={{flexDirection: 'column'}}>
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
    return (
      <View>
        {this.props.children}
      </View>
    )
  }
}

class FormContainer extends React.Component {
  render() {
    let label
    if (this.props.label) {
      label = (<Text>{this.props.label}</Text>)
    }
    return (
      <View>
        {label}
        {this.props.children}
      </View>
    )
  }
}

class FormTextInput extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = ::this.handleChange
  }
  handleChange(newValue) {
    this.props.onChange(this.props.fieldKey, newValue)
  }
  render() {
    let placeholder = this.props.placeholder || prettify(this.props.fieldKey)
    return (
      <FormContainer {...this.props}>
        <TextInput
          style={{
            height: 40,
          }}
          value={this.props.value}
          placeholder={placeholder}
          onChangeText={this.handleChange}
        />
      </FormContainer>
    )
  }
}

class ResizingTextInput extends React.Component {
  constructor(props) {
    super(props)

    this.handleSizeChange = ::this.handleSizeChange

    this.state = {
      ...this.state,
      height: this.props.minHeight,
    }
  }
  handleSizeChange(ev) {
    let newHeight = ev.nativeEvent.contentSize.height + this.props.sizingExtra
    this.setState({
      height: Math.max(newHeight, this.props.minHeight),
    })
  }
  render() {
    return (
      <TextInput
        {...this.props}
        onContentSizeChange={this.handleSizeChange}
        style={{
          ...this.props.style,
          height: this.state.height,
        }}
      />
    )
  }
}
ResizingTextInput.defaultProps = {
  minHeight: 40,
  sizingExtra: 20,
}

class FormTextAreaInput extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = ::this.handleChange

    this.state = {
      ...this.state,
      height: 80,
    }
  }
  handleChange(newValue) {
    this.props.onChange(this.props.fieldKey, newValue)
  }
  render() {
    let placeholder = this.props.placeholder || prettify(this.props.fieldKey)
    return (
      <FormContainer {...this.props}>
        <ResizingTextInput
          multiline
          value={this.props.value}
          onChangeText={this.handleChange}
          blurOnSubmit={false}
          placeholder={placeholder}
        />
      </FormContainer>
    )
  }
}
class FormCheckboxInput extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = ::this.handleChange
    this.handleLabelPress = ::this.handleLabelPress
  }
  handleChange(newValue) {
    this.props.onChange(this.props.fieldKey, newValue)
  }
  handleLabelPress() {
    this.handleChange(!this.props.value)
  }
  render() {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <CheckBox
          value={this.props.value}
          onValueChange={this.handleChange}
        />
        <TouchableOpacity
          onPress={this.handleLabelPress}
        >
          <Text>
            {this.props.label || prettify(this.props.fieldKey)}
          </Text>
        </TouchableOpacity>
      </View>
    )
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
