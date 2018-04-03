import React from "react";
import ReactHeatmap from "react-heatmap";
import { CopyToClipboard } from "react-copy-to-clipboard";

import "./App.css";

class App extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      data: [],
      width: 640,
      height: 480,
      value: 1,
      maxValue: 5,
      isPercent: false,
      isFormat: false,
      isSampling: false
    };

    this.currentMousePos = { x: 0, y: 0, value: 0 };

    this.saveMousePos = this.saveMousePos.bind(this);
    this.sampleMousePos = this.sampleMousePos.bind(this);
    this.startSampling = this.startSampling.bind(this);
    this.pauseSampling = this.pauseSampling.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.randFromInterval = this.randFromInterval.bind(this);
    this.setRandomData = this.setRandomData.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    this.generationElement.addEventListener("mouseenter", this.startSampling);
    this.generationElement.addEventListener("mouseleave", this.pauseSampling);
    this.generationElement.addEventListener("mousemove", this.saveMousePos);
    this.mouseSampleInterval = window.setInterval(this.sampleMousePos, 100);
  }

  componentWillUnmount() {
    this.generationElement.removeEventListener("mouseenter", this.saveMousePos);
    this.generationElement.removeEventListener("mouseleave", this.saveMousePos);
    this.generationElement.removeEventListener("mousemove", this.saveMousePos);
    window.clearInterval(this.mouseSampleInterval);
  }

  saveMousePos(event) {
    const { isSampling, isPercent, width, height, value } = this.state;

    if (!isSampling) {
      return;
    }

    const { pageX, pageY } = event;
    const { offsetLeft, offsetTop } = this.generationElement;

    let x = pageX - offsetLeft;
    let y = pageY - offsetTop;

    if (isPercent) {
      x = Math.floor(x * 100 / width);
      y = Math.floor(y * 100 / height);
    }

    this.currentMousePos = { x, y, value };
  }

  sampleMousePos() {
    if (!this.state.isSampling || !this.currentMousePos.value) {
      return;
    }

    const data = [...this.state.data];

    data.push(this.currentMousePos);
    this.setState({ data });
  }

  startSampling() {
    this.setState({ isSampling: true });
  }

  pauseSampling() {
    this.setState({ isSampling: false });
  }

  reset() {
    this.setState({ data: [] });
  }

  randFromInterval(min, max) {
    return Math.ceil(Math.random() * (max - min + 1) + min);
  }

  setRandomData() {
    const { width, height, isPercent, maxValue } = this.state;
    const data = [];
    const area = width * height;
    const dotsCount = this.randFromInterval(
      area * 0.0000001,
      area * (isPercent ? 0.005 : 0.001)
    );

    for (let i = 0; i < dotsCount; i++) {
      let x = this.randFromInterval(0, width - 1);
      let y = this.randFromInterval(0, height - 1);
      const value = this.randFromInterval(1, maxValue);

      if (isPercent) {
        x = Math.ceil(x * 100 / width);
        y = Math.ceil(y * 100 / height);
      }

      data.push({ x, y, value });
    }

    this.setState({ data });
  }

  handleInputChange(event) {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  }

  handleCheckboxChange(event) {
    const { name, checked } = event.target;

    this.setState({ [name]: checked });
  }

  handleTextareaChange(event) {
    try {
      const { value } = event.target;
      const data = JSON.parse(value);

      this.setState({ data });
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const {
      data,
      width,
      height,
      value,
      maxValue,
      isPercent,
      isFormat
    } = this.state;
    const json = JSON.stringify(data, null, isFormat ? 2 : 0);

    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Lorem Heatmap</h1>
        </header>

        <div className="heatmap-generation-controls">
          <button onClick={this.reset}>Reset</button>
          <button onClick={this.setRandomData}>Randomize</button>
          <label>
            Width:{" "}
            <input
              type="number"
              name="width"
              value={width}
              onChange={this.handleInputChange}
            />
          </label>
          <label>
            Height:{" "}
            <input
              type="number"
              name="height"
              value={height}
              onChange={this.handleInputChange}
            />
          </label>
          <label>
            Value:{" "}
            <input
              type="number"
              name="value"
              value={value}
              onChange={this.handleInputChange}
              min="1"
              max="5"
            />
          </label>
          <label>
            Max value:{" "}
            <input
              type="number"
              name="maxValue"
              value={maxValue}
              onChange={this.handleInputChange}
              min="1"
              max="5"
            />
          </label>
          <label>
            <input
              type="checkbox"
              name="isPercent"
              checked={isPercent}
              onChange={this.handleCheckboxChange}
            />
            {`Units: ${isPercent ? "Percent" : "Pixels"}`}
          </label>
          <label>
            <input
              type="checkbox"
              name="isFormat"
              checked={isFormat}
              onChange={this.handleCheckboxChange}
            />
            {`Formatting: ${isFormat ? "On" : "Off"}`}
          </label>
        </div>

        <div
          className="heatmap-generation-field"
          ref={el => (this.generationElement = el)}
          style={{ width, height }}
        >
          <ReactHeatmap
            className="heatmap"
            data={data}
            unit={isPercent ? "percent" : "pixels"}
          />
        </div>

        <div className="heatmap-data-output">
          <textarea value={json} onChange={this.handleTextareaChange} />
          <CopyToClipboard text={json}>
            <button>Copy to clipboard</button>
          </CopyToClipboard>
        </div>
      </div>
    );
  }
}

export default App;
