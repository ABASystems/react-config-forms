import JQuery from 'jquery'
import React from 'react'
import StringTemplate from 'string-template'
import Moment from 'moment'
import Clone from 'clone'
import { markdown } from 'markdown'

import Fields from './fields.js'

class DynamicForm extends React.PureComponent {
  constructor(props) {
    super(props);

    
  }

  componentDidMount() {
    // todo: load initials when applicable (used to be done by setConfig, now is not)

    if (this.props.configSelector) {
      var inputElement = JQuery(this.props.configSelector).first();
      if (inputElement) {
        var initialConfig = null;
        if (inputElement.is('textarea') || inputElement.is('input')) {
          initialConfig = inputElement.val();
          inputElement.on('input val change', (event) => {
            var newValue = this.value;
            this.setConfig(newValue);
          });
        } else {
          initialConfig = inputElement.text();
        }
        this.setConfig(initialConfig);
      } else {
        console.error('Unable to find input element for selector:', this.props.configSelector);
      }
    }
    if (this.props.styleSelector) {
      var styleElement = JQuery(this.props.styleSelector).first();
      if (styleElement) {
        var initialStyle = '';
        if (styleElement.is('textarea') || styleElement.is('input')) {
          initialStyle = styleElement.val();
          styleElement.on('input val change', (event) => {
            var newValue = this.value;
            this.setStyle(newValue);
          });
        } else {
          initialStyle = styleElement.text();
        }
        this.setStyle(initialStyle);
      } else {
        console.error('Unable to find input element for selector:', this.props.styleSelector);
      }
    }
    if (this.props.config) {
      this.setConfig(this.props.config);
    }
    if (this.props.style) {
      this.setStyle(this.props.style);
    }
  }
  componentDidUpdate(nextProps, nextState) {
    if (this.props.output) {
      var config = JSON.stringify(this.getConfigValues());
      var outputJqElement = JQuery(this.props.output);
      if (outputJqElement.is('input') || outputJqElement.is('textarea'))
        outputJqElement.val(config);
      else
        outputJqElement.text(config);
    }
  }

  
  setStyle(styles) {
    var reactClass = this;
    window.setTimeout(function() {
      reactClass.setState(state => {
        state.style = styles;
        return state;
      });
    }, 50);
  }
  getConfigValues() {
    var values = {};
    if (!this.state.config)
      return values;

    this.state.config.fields.forEach(field => {
      values[field.key] = this.state.values[field.key];
    });
    return values;
  }

  

  
  
  render() {
    
  }
}
DynamicForm.defaultProps = {};

export default DynamicForm
