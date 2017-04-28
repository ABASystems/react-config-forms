import JQuery from 'jquery'
import React from 'react'
import Yaml from 'js-yaml'
import StringTemplate from 'string-template'
import Moment from 'moment'
import Clone from 'clone'
import { markdown } from 'markdown'

import Config from './config.js'
import Fields from './fields.js'

class DynamicForm extends React.PureComponent {
  constructor(props) {
    super(props);

    var context = {
      now_date: Moment().format('DD/MM/YYYY'),
      now_hm: Moment().format('hh:mm'),
      ...this.props.context,
    };
    var parsedConfig = this.parseConfig(this.props.config || '');
    var values = this.props.result;
    if (!values) {
      if (parsedConfig.config && Array.isArray(parsedConfig.fields)) {
        parsedConfig.fields.map((field) => {
          if (typeof values[field.key] === 'undefined') {
            if (Array.isArray(field.initial)) {
              values[field.key] = field.initial;
            }
            else if (typeof field['initial'] === 'string') {
              values[field.key] = StringTemplate(field.initial, context);
            }
          }
        });
      }
      else {
        values = {};
      }
    }

    this.state = {
      ...this.state,
      style: '',
      values: values,
      context: context,
      ...parsedConfig,
    };
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

  parseConfig(config) {
    var result = {
      config: {},
      parseError: null,
      formatError: null,
    };

    try {
      result.config = Yaml.safeLoad(config);
      var cleanedConfig = Config(result.config);
      if (typeof cleanedConfig === 'string') {
        result.config = null;
        result.formatError = cleanedConfig;
      }
      else {
        result.config = cleanedConfig;
      }
    }
    catch (e) {
      result.parseError = e.message;
    }

    return result;
  }
  setConfig(config) {
    this.setState(this.parseConfig(config));
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

  handleValueChange(key, value) {
    var reactClass = this;
    if (reactClass.props.readOnly) {
      window.notify({
        title: 'This form cannot be edited',
        body: 'It is a read-only preview of an existing response.',
      });
      return;
    }
    reactClass.setState(state => {
      var newValues = Clone(state.values);
      newValues[key] = value;
      state.values = newValues;
      return state;
    }, function() {
      if (reactClass.props.onChange)
        reactClass.props.onChange(reactClass.state.values);
    });
  }

  renderField(field, key, layoutSettings) {
    var renderer;
    switch (field.type) {
      case 'text':
        renderer = Fields.Text;
        break;
      case 'textarea':
        renderer = Fields.TextArea;
        break;
      case 'checkbox':
        renderer = Fields.Checkbox;
        break;
      case 'select':
        renderer = Fields.Select;
        break;
      case 'multiselect':
        renderer = Fields.MultiSelect;
        break;
      case 'checkboxgroup':
        renderer = Fields.CheckboxGroup;
        break;
      case 'pass-fail-na':
        renderer = Fields.PassFailNA;
        break;

      default:
        console.warn(`Renderer not found for field type ${field.type}`);
        renderer = 'noscript';
        break;

    }
    var fieldProps = {
      ...field,
      layoutSettings: layoutSettings,
      key: key,
      fieldKey: field.key,
      value: this.state.values[field.key],
      valueChange: this.handleValueChange.bind(this),
    };
    return React.createElement(renderer, fieldProps);
  }
  renderContents(contents, includes) {
    var renderedContents = [];
    contents.forEach((item, itemIndex) => {
      switch (item.type) {
        case 'group':
          const result = this.renderContents(item.contents, includes);
          renderedContents.push(
            <div key={`item-${itemIndex}`} className={item.class}>{result.render}</div>
          );
          includes = {
            ...includes,
            ...result.includes,
          };
          break;

        case 'field':
          const { fields } = this.state.config;
          const isItemField = field => (field.key === item.field);
          const checkIncluded = field => !(field.key in includes)
          fields
            .filter(isItemField)
            .filter(checkIncluded)
            .forEach((field, idx) => {
              renderedContents.push(this.renderField(field, `item-${itemIndex}`, item));
              includes[field.key] = true;
            });
          break;

        case 'text':
          const text = item.text ? StringTemplate(item.text, this.state.context) : (<span>&nbsp;</span>);
          const textElement = (<div key={`item-${itemIndex}`} className={item.class}>{text}</div>);
          renderedContents.push(textElement);
          break;

        case 'markdown':
          const rawMarkdown = item.text || '';
          const className = item.class || '';
          renderedContents.push(
            <div key={`item-${itemIndex}`} className={className} dangerouslySetInnerHTML={{__html: markdown.toHTML(rawMarkdown)}} />
          )
          break;
      }
    });
    return {
      render: renderedContents,
      includes: includes,
    };
  }
  render() {
    if (this.state.parseError) {
      return (
        <p className="alert bg-warning">Error parsing config: {this.state.parseError}</p>
      );
    }
    if (this.state.formatError) {
      return (
        <p className="alert bg-warning">Content error in config: {this.state.formatError}</p>
      );
    }

    let renderedFields = [];
    let result;

    const { layout, fields } = this.state.config;

    if (layout) {
      result = this.renderContents(layout, {});
      renderedFields = result.render;
    }

    fields.forEach(field => {
      if (!(layout && field.key in result.includes))
        renderedFields.push(this.renderField(field, field.key, {}));
    });

    return (
      <div className="rendered-dynamic-form rDF">
        <style scoped>{this.state.style}</style>
        {renderedFields}
      </div>
    );
  }
}
DynamicForm.defaultProps = {};

export default DynamicForm
