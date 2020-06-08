import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill'; // ES6
import brace from 'brace';
import AceEditor from 'react-ace';

import { convertOptions, DEFAULT_CONVERT } from './convert.js';
import { EditorElement, opsDefault } from './utils.js';

import 'react-quill/dist/quill.snow.css'; // ES6
import 'brace/mode/html';
import 'brace/theme/tomorrow';
import './main.css';

// convert buttons group
const ConvertOptions = ({ active, setActive }) => {
	const optionButtons = convertOptions.map(option => {
		const btnClass = (option.key === active) ? "btn-primary" : "btn-secondary";
		return <button className={`btn ${btnClass} option`} onClick={() => { setActive(option) }}>{option.display}</button>;
	})

	return (
		<div className="convert-options-group row">
			{optionButtons}
		</div>
	);
}

const App = () => {
	const [convertedText, setConvertedText] = useState("");
	const [activeConvert, setActiveConvert] = useState(DEFAULT_CONVERT);
	const [currentOps, setCurrentOps] = useState(opsDefault);

	// convert ops to custom element class array
	const processOps = (opsTree) => {
		if (!opsTree) {
			return;
		}

		let elements = opsTree.map(op => new EditorElement(op));

		// filter empty elements
		elements = elements.filter((element, index) => {
			if (!element.originalContent || !element.originalContent.replace(/ /gi, "") || !element.originalContent.replace(/ /gi, "").length) {
				return false;
			}

			if (!element.originalContent || !element.originalContent.replace(/\n/gi, "") || !element.originalContent.replace(/\n/gi, "").length) {
				return false;
			}

			if (!elements[index + 1] && element.isEmpty()) {
				return false; // remove new lines from end
			}

			return true;
		})

		// store next and previous
		for (let i = 0; i < elements.length; i++) {
			if (elements[i - 1]) {
				elements[i].setPreviousElement(elements[i - 1]);
			}
			if (elements[i + 1]) {
				elements[i].setNextElement(elements[i + 1]);
			}
		}

		console.log(elements);
		console.log(opsTree);

		// do the conversion
		const converter = convertOptions.find((converter) => { return converter.key === activeConvert; });
		setConvertedText(converter.convertFunc(elements));
	}

	// handle paste
	const handleChange = (content, delta, source, editor) => {
		const opsTree = editor.getContents().ops;
		setCurrentOps(opsTree);

		window.editor = editor; // for tests
	}

	// start the conversion process if changed the text or the convert option.
	useEffect(() => {
		processOps(currentOps);
	}, [currentOps, activeConvert]);

	const changeConvertOption = (option) => {
		setActiveConvert(option.key);
	}

	return (
		<div className="main-container">
			<div className="custom-bg"></div>
			<div className="mb-4"></div>
			<div className="text-center mb-5">
				<h1 className="display-4">HTML Conversion Tool</h1>
			</div>
			<ConvertOptions active={activeConvert} setActive={changeConvertOption} />
			<div className="row editors">
				<div className="col first-editor">
					<ReactQuill onChange={handleChange} />
				</div>
				<div className="col second-editor">
					<AceEditor
						placeholder="Converted html will be shown here."
						mode="html"
						theme="tomorrow"
						name="ace-editor-converted"
						fontSize={18}
						showPrintMargin={false}
						showGutter={true}
						highlightActiveLine={true}
						value={convertedText}
						setOptions={{
							enableBasicAutocompletion: false,
							enableLiveAutocompletion: false,
							enableSnippets: false,
							showLineNumbers: true,
							tabSize: 4,
						}}
						editorProps={{
							$blockScrolling: Infinity
						}} />
				</div>
			</div>
		</div>
	);
}

export default App;
