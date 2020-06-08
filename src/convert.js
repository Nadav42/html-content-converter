import { cleanText } from './utils.js';

// convert headings + p with divs
function convertContentAuto(elements) {
    let html = "";
    const defaultTag = "p";
    let shouldCloseDiv = false;

    elements.forEach((element, index) => {
        let content = element.content;
        const previousElement = element.previousElement;
        const nextElement = element.nextElement;

        let openDiv = false;
        let currentTag = defaultTag;
        let indent = "";

        if (element.isHeading()) {
            currentTag = element.content.substring(0, 2);
            content = element.content.substring(2);
            openDiv = true;
        }
        else if (previousElement && previousElement.isHeading()) {
            currentTag = previousElement.content.substring(0, 2);
            openDiv = true;
        }

        if (element.shouldConvert()) {
            if (openDiv) {
                if (shouldCloseDiv) {
                    html = html + `</div>\n`; // if need to open new div then close old div
                    shouldCloseDiv = false;
                }

                html = html + `<div className="section-block">\n`;
                shouldCloseDiv = true;
            }

            if (shouldCloseDiv) {
                indent = "\t";
            }

            html = html + `${indent}<${currentTag.toLowerCase()}>${cleanText(content)}</${currentTag.toLowerCase()}>`;

            if (nextElement) {
                html = html + `\n`;
            }
            else if (!nextElement && shouldCloseDiv) {
                html = html + `\n</div>`; // no more elements, must close.
            }
        }
    });

    return html;
}

// convert headings + p without div
function convertContentParagraphOnly(elements) {
    let html = "";
    const defaultTag = "p";

    elements.forEach((element, index) => {
        let content = element.content;
        const previousElement = element.previousElement;
        const nextElement = element.nextElement;

        let currentTag = defaultTag;

        if (element.isHeading()) {
            currentTag = element.content.substring(0, 2);
            content = element.content.substring(2);
        }
        else if (previousElement && previousElement.isHeading()) {
            currentTag = previousElement.content.substring(0, 2);
        }

        if (element.shouldConvert()) {
            html = html + `<${currentTag.toLowerCase()}>${cleanText(content)}</${currentTag.toLowerCase()}>`;

            if (nextElement) {
                html = html + `\n`;
            }
        }
    });

    return html;
}

// like paragraphs but ul li
function convertContentListItems(elements) {
    let html = "";
    const defaultTag = "p";
    let shouldCloseDiv = false;

    elements.forEach((element, index) => {
        let content = element.content;
        const previousElement = element.previousElement;
        const nextElement = element.nextElement;

        let openDiv = false;
        let currentTag = defaultTag;
        let indent = "";

        if (element.isHeading()) {
            currentTag = element.content.substring(0, 2);
            content = element.content.substring(2);
            openDiv = true;
        }
        else if (previousElement && previousElement.isHeading()) {
            currentTag = previousElement.content.substring(0, 2);
            openDiv = true;
        }

        if (element.shouldConvert()) {
            if (openDiv) {
                if (shouldCloseDiv) {
                    html = html + `</li>\n`; // if need to open new div then close old div
                    shouldCloseDiv = false;
                }

                html = html + `<li>\n`;
                shouldCloseDiv = true;
            }

            if (shouldCloseDiv) {
                indent = "\t";
            }
           
            if (!shouldCloseDiv && currentTag === defaultTag) {
                currentTag = "li";
            }
 
            html = html + `${indent}<${currentTag.toLowerCase()}>${cleanText(content)}</${currentTag.toLowerCase()}>`;

            if (nextElement) {
                html = html + `\n`;
            }
            else if (!nextElement && shouldCloseDiv) {
                html = html + `\n</li>`; // no more elements, must close.
            }
        }
    });

    html = "\t" + html.split("\n").join("\n\t");
    return `<ul>\n${html}\n</ul>`;
}

function convertToFaqsJson(elements) {
    const faqs = []
    let faq = {};

    elements.forEach((element, index) => {
        let content = element.content;
        const previousElement = element.previousElement;
        const nextElement = element.nextElement;

        if (element.shouldConvert() && faq.question) {
            faq.answer = content;
        }
        else if (element.isHeading() && !faq.question) {
            content = element.content.substring(2);
            faq.question = content;
        }
        else if (previousElement && previousElement.isHeading() && !faq.question) {
            faq.question = content;
        }

        if (faq.question && faq.answer) {
            faqs.push(faq);
            faq = {};
        }
    });

    return JSON.stringify(faqs, null, 4);
}

export const convertOptions = [
    { key: "CONVERT_AUTO", display: "Auto", convertFunc: convertContentAuto },
    { key: "CONVERT_PARAGRAPH_ONLY", display: "Paragraphs", convertFunc: convertContentParagraphOnly },
    { key: "CONVERT_LIST_ITEM", display: "ul li", convertFunc: convertContentListItems },
    { key: "CONVERT_FAQS", display: "FAQ", convertFunc: convertToFaqsJson }
];

export const DEFAULT_CONVERT = "CONVERT_AUTO";