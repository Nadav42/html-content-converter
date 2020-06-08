import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill'; // ES6
import brace from 'brace';
import AceEditor from 'react-ace';
import ReactDiffViewer from 'react-diff-viewer';

import { EditorElement } from './utils.js';

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
		return <li>{text}</li>
	});

	return (
		<div>
			<h3>Couldn't replace the following:</h3>
			<ol>
				{failElements}
			</ol>
		</div>
	);
}

const ReplaceResultsMessage = ({ replaceSuccessRate, replaceFails, show }) => {
	if (!show || replaceSuccessRate === null || replaceSuccessRate === undefined) {
		return null;
	}

	let successClass = "text-success";

	if (replaceSuccessRate <= 80) {
		successClass = "text-danger";
	}
	else if (replaceSuccessRate < 100) {
		successClass = "text-info";
	}

	return (
		<div className="text-center">
			<h3 className={successClass}>Replace Success Rate: {replaceSuccessRate}%</h3>
			<ReplaceFailsList replaceFails={replaceFails} />
		</div>
	);
}

const htmlArrayToText = (arr) => {
	let html = "";

	arr = arr.filter(line => {
		const cleanLine = line.trim();

		if (!cleanLine || !cleanLine.length || cleanLine === "\r") {
			return false;
		}

		return true;
	})

	arr.forEach(item => {
		html = html + item + "\n\n";
	})

	return html;
}

const DiffViewer = ({ replaceSuccessRate, originalContentOps, translationContentOps, codeOriginalJSX, docDiff }) => {
	if (!originalContentOps || !translationContentOps || replaceSuccessRate >= 100) {
		return null;
	}

	const originalElements = translationProcessOpsToElements(originalContentOps);
	let docsHTMLArrayOriginal = originalElements.map(element => { return element.content });

	const translationElements = translationProcessOpsToElements(translationContentOps);
	let docsHTMLArrayTranslation = translationElements.map(element => { return element.content });

	if (docDiff) {
		return <ReactDiffViewer oldValue={htmlArrayToText(docsHTMLArrayOriginal)} newValue={htmlArrayToText(docsHTMLArrayTranslation)} splitView={true} />;
	}

	if (!codeOriginalJSX || !codeOriginalJSX.length) {
		return null;
	}

	let jsxCleanHTMLArray = codeOriginalJSX.replace(/<[^>]*>/gi, "\n"); // replace all html tags with new lines
	jsxCleanHTMLArray = jsxCleanHTMLArray.split("\n"); // make the array

	return <ReactDiffViewer oldValue={htmlArrayToText(docsHTMLArrayOriginal)} newValue={htmlArrayToText(jsxCleanHTMLArray)} splitView={true} />;
}

const ErrorMessage = ({ error }) => {
	if (!error || !error.length) {
		return null;
	}

	return (
		<div className="text-center">
			<h2>{error}</h2>
			<hr></hr>
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

		if (originalElements.length !== translationElements.length) {
			setErrorMessage(`Lines count does not match! Original Doc - ${originalElements.length} lines | Translation Doc - ${translationElements.length} lines`)
		}

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
			<div className="errors-container" hidden={!conversionFinished}>
				<ErrorMessage error={errorMessage} />
				<ReplaceResultsMessage replaceSuccessRate={replaceSuccessRate} replaceFails={replaceFails} show={conversionFinished && !errorMessage} />
				<DiffViewer replaceSuccessRate={replaceSuccessRate} originalContentOps={originalContentOps} translationContentOps={translationContentOps} codeOriginalJSX={codeOriginalJSX} docDiff={errorMessage && errorMessage.length > 0} />
			</div>
		</div>
	);
}

export default App;
