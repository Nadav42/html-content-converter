import React from 'react';
import HTMLFormatter from "./HTMLFormatter";
import TranslationsFormatter from "./TranslationsFormatter";
import Tabs from './components/tabs/Tabs'
import Tab from './components/tabs/Tab'

const App = () => {
	return (
		<div>
			<Tabs>
				<Tab title="HTML Convert">
					<div><HTMLFormatter /></div>
				</Tab>
				<Tab title="Translations">
					<div><TranslationsFormatter /></div>
				</Tab>
			</Tabs>
		</div>
	);
};

export default App;
