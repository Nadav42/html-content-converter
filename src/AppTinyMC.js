import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

class App extends React.Component {
	handleEditorChange = (content, editor) => {
		content = content.replace(/ [^>/]*>/gi, ">");
		content = content.replace(/<[/]?span[^>]*>/gi, "");
		content = content.replace(/<[/]?strong[^>]*>/gi, "");
		content = content.replace(/<[/]?br[^>]*>/gi, "");
		content = content.replace(/<p>&nbsp;<[/]p>/gi, "");
		content = content.replace(/ <[/]p>/gi, "</p>");

		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(content, 'text/html');
		window.hdoc = htmlDoc;

		console.log(htmlDoc)

		console.log('Content was updated:', content);
		console.log(editor);
		window.editor = editor;
	}

	render() {
		return (
			<div className="container w-50 mt-4">
				<Editor
					outputFormat="html"
					init={{
						height: 500,
						menubar: false,
					}}
					onEditorChange={this.handleEditorChange}
				/>
			</div>
		);
	}
}

export default App;