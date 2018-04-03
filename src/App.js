import React from "react";
import ReactHeatmap from "react-heatmap";
import { CopyToClipboard } from "react-copy-to-clipboard";

import logo from "./logo.svg";
import "./App.css";

class App extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      data: [],
      width: 640,
      height: 480,
      value: 1,
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
    if (!this.state.isSampling) {
      return;
    }

    const { pageX, pageY } = event;
    const {
      offsetLeft,
      offsetTop,
      offsetWidth,
      offsetHeight
    } = this.generationElement;
    const x = pageX - offsetLeft;
    const y = pageY - offsetTop;

    this.currentMousePos = {
      x: Math.floor(x * 100 / offsetWidth),
      y: Math.floor(y * 100 / offsetHeight),
      value: this.state.value
    };
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
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  setRandomData() {
    const { width, height } = this.state;
    const data = [];
    const area = width * height;
    const dotsCount = this.randFromInterval(area * 0.001, area * 0.12);

    for (let i = 0; i < dotsCount; i++) {
      const x = this.randFromInterval(0, width - 1);
      const y = this.randFromInterval(0, height - 1);
      const value = this.randFromInterval(1, 5);

      data.push({ x: x, y: y, value: value });
    }

    this.setState({ data: data });
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
    const { data, width, height, value, isFormat } = this.state;
    const json = JSON.stringify(data, null, isFormat ? 2 : 0);

    return (
      <div className="app">
        <header className="app-header">
          <img src={logo} className="app-logo" alt="logo" />
          <h1 className="app-title">Lorem Heatmap</h1>
        </header>

        <div
          className="heatmap-generation-field"
          ref={el => (this.generationElement = el)}
          style={{ width, height }}
        >
          <ReactHeatmap className="heatmap" data={data} />
        </div>

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
            <input
              type="checkbox"
              name="isFormat"
              checked={isFormat}
              onChange={this.handleCheckboxChange}
            />Formatting
          </label>
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
