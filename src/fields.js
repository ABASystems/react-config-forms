import React from 'react'
import JQuery from 'jquery'
import ClassNames from 'classnames'
import ReactSelect from 'react-select'

class BaseField extends React.Component {
  handleChange(event) {
    this.props.valueChange(this.props.fieldKey, event.target.value);
  }
}

class Checkbox extends BaseField {
  handleChange(event) {
    this.props.valueChange(this.props.fieldKey, this.refs.field.checked);
  }
  render() {
    var heading;
    if (this.props.heading) {
      heading = (
        <p><strong>{this.props.heading}</strong></p>
      );
    }
    return (
      <div className="form-group checkbox">
        <div className="checkbox">
          {heading}
          <label>
            <input
              ref="field"
              type="checkbox"
              onChange={this.handleChange.bind(this)}
              checked={this.props.value}
            />
            {this.props.label}
          </label>
        </div>
      </div>
    );
  }
}

class Text extends BaseField {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.label != this.props.label)
      return true;
    if (nextProps.fieldKey != this.props.fieldKey)
      return true;
    if (nextProps.value != this.props.value)
      return true;
    if (nextProps.layoutSettings !== this.props.layoutSettings)
      return true;
    return false;
  }

  render() {
    var label;
    if (this.props.label) {
      label = (
        <label className="control-label">
          {this.props.label}
        </label>
      );
    }

    return (
      <div className={ClassNames(
        'form-group text',
        'field-'+this.props.fieldKey,
        this.props.layoutSettings.class
      )}>
        {label}
        <input
          className="form-control"
          type="text"
          value={this.props.value}
          placeholder={this.props.placeholder}
          onChange={this.handleChange.bind(this)}
        />
      </div>
    );
  }
}

class TextArea extends BaseField {
  render() {
    const { label, value, placeholder, fieldKey } = this.props;

    return (
      <div className={ClassNames('form-group textarea', 'field-'+fieldKey)}>
        {label && <label className="control-label">{label}</label>}
        <textarea
          className="form-control"
          value={value}
          placeholder={placeholder}
          onChange={this.handleChange.bind(this)}
        />
      </div>
    );
  }
}

class Select extends BaseField {
  render() {
    const { label, options, value } = this.props;

    return (
      <div className={ClassNames(
        'form-group select',
        'field-'+this.props.fieldKey,
        this.props.layoutSettings.class
      )}>
        {label && <label className="control-label">{label}</label>}
        <select
          className="form-control"
          value={value}
          onChange={this.handleChange.bind(this)}
        >
          {options.map(opt =>
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )}
        </select>
      </div>
    );
  }
}

class MultiSelect extends BaseField {
  handleChange(newValue) {
    const formValue = (newValue || []).map(val => val.value);
    this.props.valueChange(this.props.fieldKey, formValue);
  }
  render() {
    const { label, options, value } = this.props;
    const widgetValue = (value || [])
      .filter(val => options.map(opt => opt.value).includes(val));

    return (
      <div className="form-group select">
        {label && <label className="control-label">{label}</label>}
        <ReactSelect
          multi={true}
          value={widgetValue}
          onChange={this.handleChange.bind(this)}
          options={options}
        />
      </div>
    );
  }
}

class CheckboxGroup extends BaseField {
  constructor(props) {
    super(props);
    this.state = { values: [] };
  }

  handleInputChange(e) {
    const val = e.target.value;
    const { values } = this.state;
    const filtered = values.filter(v => v !== val);
    const newVal = e.target.checked ? [...filtered, val] : filtered;
    this.setState({ values: newVal});
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.values !== this.state.values) {
      this.props.valueChange(this.props.fieldKey, nextState.values);
    }
  }

  render() {
    const { fieldKey, value, label, layoutSettings, options } = this.props;
    const currentVal = value || [];
    const CheckboxItem = (props) => (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            name={props.fieldKey}
            value={props.value}
            checked={props.checked}
            onChange={props.onChange} />{props.label}
        </label>
      </div>
    );
    return (
      <div className={ClassNames('form-group', layoutSettings.class)}>
        <label>{label}</label>
        {options.map((opt, idx) =>
          <CheckboxItem
            key={`${opt.fieldKey}-${idx}`}
            fieldKey={opt.fieldKey}
            value={opt.value}
            label={opt.label}
            checked={currentVal.includes(opt.value)}
            onChange={::this.handleInputChange} />
        )}
      </div>
    );
  }
}

class RadioOptions extends BaseField {

  handleChange(event) {
    var newValue = null;
    var checked = JQuery(this.refs.options).find('input[type="radio"]:checked');
    if (checked)
      newValue = checked.prop('value');
    this.props.valueChange(this.props.fieldKey, newValue);
  }

  render() {
    const { heading, label, options } = this.props;

    return (
      <div className={ClassNames('form-group radio-options', this.props.layoutSettings.class)}
        ref="options">
        {heading && <p className="heading"><strong>{heading}</strong></p>}
        {label && <label className="control-label label">{label}</label>}
        {options.map(opt =>
          <label key={`option-${opt.value}`} className="option">
            <input
              type="radio"
              name={this.props.fieldKey}
              value={opt.value}
              onChange={this.handleChange.bind(this)}
              checked={(this.props.value == opt.value)}
            />
            {opt.label}
          </label>
        )}
      </div>
    );
  }
}

class PassFailNA extends RadioOptions {

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.label != this.props.label)
      return true;
    if (nextProps.fieldKey != this.props.fieldKey)
      return true;
    if (nextProps.value != this.props.value)
      return true;
    if (nextProps.layoutSettings !== this.props.layoutSettings)
      return true;
    return false;
  }
}

PassFailNA.defaultProps = {
  options: [
    {value: 'yes', label: 'Yes',},
    {value: 'no', label: 'No',},
    {value: 'na', label: 'N/A',},
  ],
};

export default {
  Checkbox,
  Text,
  TextArea,
  Select,
  MultiSelect,
  PassFailNA,
  CheckboxGroup
}
