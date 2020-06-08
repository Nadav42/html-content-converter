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

// convert ops to custom element class array
const translationProcessOpsToElements = (opsTree) => {
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

		if (!element.content || element.content.length === 0) {
			return false;
		}

		if (element.content.length === 2 && element.content[0].toLowerCase() === "h" && Number(element.content[1])) {
			return false;
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

	// console.log(elements);
	// console.log(opsTree);

	// do the conversion
	return elements;
}

const CodeEditor = ({ value, onChange, placeholder }) => {
	return (
		<AceEditor
			placeholder={placeholder}
			mode="html"
			theme="tomorrow"
			name="ace-editor-converted"
			fontSize={18}
			showPrintMargin={false}
			showGutter={true}
			highlightActiveLine={true}
			value={value}
			onChange={onChange}
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
	);
}

const ReplaceFailsList = ({ replaceFails }) => {
	if (!replaceFails || !replaceFails.length) {
		return null;
	}

	const failElements = replaceFails.map(text => {
		return (
			<>
				<hr></hr>
				<p>{text}</p>
			</>
		)
	});

	return (
		<div>
			<h3>Couldn't replace the following:</h3>
			{failElements}
		</div>
	);
}

const ReplaceResultsMessage = ({ replaceSuccessRate, replaceFails, show }) => {
	if (!show || replaceSuccessRate === null || replaceSuccessRate == undefined) {
		return null;
	}

	let successClass = "text-success";

	if (replaceSuccessRate <= 60) {
		successClass = "text-danger";
	}
	else if (replaceSuccessRate < 100) {
		successClass = "text-warning";
	}

	return (
		<div className="text-light text-center">
			<h3 className={successClass}>Replace Success Rate: {replaceSuccessRate}%</h3>
			<ReplaceFailsList replaceFails={replaceFails} />
		</div>
	);
}

const App = () => {
	const [originalContentOps, setOriginalContentOps] = useState(null);
	const [translationContentOps, setTranslationContentOps] = useState(null);
	const [codeOriginalJSX, setCodeOriginalJSX] = useState("test");
	const [codeConvertedJSX, setCodeConvertedJSX] = useState("");

	const [replaceSuccessRate, setReplaceSuccessRate] = useState(null);
	const [replaceFails, setReplaceFails] = useState([]);
	const [errorMessage, setErrorMessage] = useState(null);
	const [conversionFinished, setConversionFinished] = useState(false);

	// handle original docs paste
	const handleOriginalChange = (content, delta, source, editor) => {
		const opsTree = editor.getContents().ops;
		setOriginalContentOps(opsTree);
		console.log(opsTree);
	}

	// handle translated docs paste
	const handleTranslationChange = (content, delta, source, editor) => {
		const opsTree = editor.getContents().ops;
		setTranslationContentOps(opsTree);
		console.log(opsTree);
	}

	// handle original JSX paste
	function handleOriginalJSXChange(newValue) {
		setCodeOriginalJSX(newValue);
		console.log(newValue);
	}

	// the convert function
	const convertJSX = (originalElements, translationElements, originalJSX) => {
		const minLength = Math.min(originalElements.length, translationElements.length);
		let convertedJSX = originalJSX;
		let replacedCounter = 0;
		const fails = [];

		for (let index = 0; index < minLength; index++) {
			const originalContent = originalElements[index].content;
			const translatedContent = translationElements[index].content;

			console.log("replace:", originalContent);
			console.log("with:", translatedContent);

			if (convertedJSX.includes(originalContent)) {
				convertedJSX = convertedJSX.replace(originalContent, translatedContent);
				replacedCounter = replacedCounter + 1;
			}
			else {
				fails.push(originalContent);
			}
		}

		console.log("originalElements:", originalElements);
		console.log("translationElements:", translationElements);

		let successRate = (replacedCounter / minLength) * 100;
		successRate = Number.parseFloat(successRate).toFixed(2);
		setReplaceSuccessRate(successRate);
		setReplaceFails(fails);

		return convertedJSX;
	}

	// start the conversion process if changed the text or the convert option.
	useEffect(() => {
		setConversionFinished(false);
		setErrorMessage(null);

		if (!originalContentOps || !translationContentOps || !codeOriginalJSX || !codeOriginalJSX.length) {
			return;
		}

		const originalElements = translationProcessOpsToElements(originalContentOps);
		const translationElements = translationProcessOpsToElements(translationContentOps);
		const jsx = convertJSX(originalElements, translationElements, codeOriginalJSX);

		setCodeConvertedJSX(jsx)
		setConversionFinished(true);
	}, [originalContentOps, translationContentOps, codeOriginalJSX]);

	return (
		<div className="main-container translations">
			<div className="custom-bg"></div>
			<div className="mb-4"></div>
			<div className="text-center mb-5">
				<h1 className="display-4">HTML Conversion Tool</h1>
			</div>
			<div className="row editors">
				<div className="col first-editor">
					<ReactQuill onChange={handleOriginalChange} placeholder="Paste original google docs here" />
				</div>
				<div className="col second-editor">
					<ReactQuill onChange={handleTranslationChange} placeholder="Paste translated google docs here" />
				</div>
			</div>
			<div className="row editors mt-5">
				<div className="col first-editor">
					<CodeEditor value={codeOriginalJSX} onChange={handleOriginalJSXChange} placeholder="Paste JSX matching original google docs here" />
				</div>
				<div className="col second-editor">
					<CodeEditor value={codeConvertedJSX} placeholder="Converted JSX will show here" />
				</div>
			</div>
			<div className="mt-4">
				<ReplaceResultsMessage replaceSuccessRate={replaceSuccessRate} replaceFails={replaceFails} show={conversionFinished} />
			</div>
		</div>
	);
}

export default App;
