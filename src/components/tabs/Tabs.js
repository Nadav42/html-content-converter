import React from "react";

import './css/tabs.css'

const DEFAULT_THEME = "light";

// never touch this
function TabWrapper(props) {
    return (
        <div hidden={props.shouldHide}>{props.children}</div>
    );
}

// for changing the design only need to change these two functions
function TabButton(props) {
    let shouldShowClass = "";

    if (!props.shouldHideTab) {
        shouldShowClass = "active";
    }

    let tabClass = `tab-button ${props.theme} ${shouldShowClass}`;

    return (
        <div className={tabClass} onClick={props.onClick}>{props.children}</div>
    );
}

function TabsList(props) {
    return (
        <div className={`tabs-list ${props.theme}`}>
            {props.children}
        </div>
    );
}

class Tabs extends React.Component {
    state = { selected: 0, activeTheme: DEFAULT_THEME }

    // this.props.children is array of Tab
    // Tab is just a container
    // Tab.children => the html

    componentDidMount() {

    }

    buildTabButton = (tab, index) => {
        // ignore if not a tab (doesn't have title)
        if (!tab || !tab.props || !tab.props.title) {
            return null;
        }

        let shouldHideTab = (this.state.selected !== index);

        return (
            <TabButton key={`tab-${index}`} shouldHideTab={shouldHideTab} theme={this.state.activeTheme} onClick={() => {
                this.switchTab(index);

                // onSwitch hook
                if (tab.props.onSwitch) {
                    tab.props.onSwitch();
                }

                // change theme it tab specified it
                if (tab.props.theme) {
                   this.updateTheme(tab.props.theme);
                }
                else {
                    this.updateTheme(DEFAULT_THEME); // restore default theme
                }
            }
            }>{tab.props.title}</TabButton>
        );
    }

    buildTabContent = (tab, index) => {
        // ignore if not a tab (doesn't have title)
        if (!tab || !tab.props || !tab.props.title) {
            return null;
        }

        // add the tab
        let shouldHideTab = (this.state.selected !== index);

        return (
            <TabWrapper key={`tab-content-${index}`} shouldHide={shouldHideTab}>{tab.props.children}</TabWrapper>
        );
    }

    switchTab = (switchTo) => {
        this.setState({ selected: switchTo });
    }

    updateTheme = (theme) => {
        if (theme !== this.state.activeTheme) {

            // update body color
            if (this.state.activeTheme) {
                document.body.classList.remove(this.state.activeTheme);
            }

            console.log(theme)
            document.body.classList.add(theme);

            // update tab colors
            this.setState({ activeTheme: theme });
        }
    }

    render() {
        let tabButtons = this.props.children.map(this.buildTabButton);
        let tabContents = this.props.children.map(this.buildTabContent);

        return (
            <div>
                <TabsList theme={this.state.activeTheme}>{tabButtons}</TabsList>
                <div className="tabs-main-content">{tabContents}</div>
            </div>
        );
    }
}
export default Tabs;