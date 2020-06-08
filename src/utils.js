export function cleanText(text) {
	text = text.replace(/\n/gi, "");
	text = text.trim();
	return text;
}

export class EditorElement {
	constructor(op, previousElement, nextElement) {
		this.originalContent = op.insert;
		this.content = op.insert;
		this.attributes = op.attributes;
		this.previousElement = previousElement || null;
		this.nextElement = nextElement || null;

		// clear new lines and trim spaces
		this.cleanContent();
	}

	setNextElement(nextElement) {
		this.nextElement = nextElement;
	}

	setPreviousElement(previousElement) {
		this.previousElement = previousElement;
	}

	cleanContent() {
		this.content = cleanText(this.content);
	}

	isEmpty() {
		if (!this.content || !this.content.length) {
			return true;
		}

		return false;
	}

	shouldConvert() {
		if (this.isEmpty()) {
			return false;
		}

		if (this.isHeading() && this.content.length <= 2) {
			return false;
		}

		return true;
	}

	isHeading() {
		return (this.content && this.content.length >= 2 && this.content[0].toLowerCase() === "h" && Number(this.content[1]) > 0);
	}

	getNextNotEmpty() {
		let next = this.nextElement;

		while (next) {
			if (!next.isEmpty()) {
				return next;
			}
			next = next.nextElement;
		}

		return next;
	}

	toHTML() {

	}
}

export const opsDefault = [
	{
		"attributes": {
			"background": "transparent",
			"color": "#ff0000",
			"bold": true
		},
		"insert": "H1"
	},
	{
		"attributes": {
			"background": "transparent",
			"color": "#980000",
			"bold": true
		},
		"insert": " "
	},
	{
		"attributes": {
			"background": "transparent",
			"color": "#000000",
			"bold": true
		},
		"insert": "Live Casino Roulette Dealers"
	},
	{
		"insert": "\n\n"
	},
	{
		"attributes": {
			"background": "transparent",
			"color": "#000000"
		},
		"insert": "Live roulette brings the classic, fast-paced game into players’ homes courtesy of real-time video streaming. And at SpinGenie, you have more than 30 stunning live roulette tables to choose from. "
	},
	{
		"insert": "\n\n"
	},
	{
		"attributes": {
			"background": "transparent",
			"color": "#000000"
		},
		"insert": "There may be multiple variations of live roulette online, but the core mechanics are the same: a dealer spins the wheel, players place bets on the outcome, and one or more people may win. It’s that simple. "
	},
	{
		"insert": "\n\n"
	},
	{
		"attributes": {
			"background": "transparent",
			"color": "#000000"
		},
		"insert": "Standard online roulette games depend on RNGs (Random Number Generators) to stay fair and ensure players have the same odds of winning as in a live version. While it might seem totally different to online RNG roulette, live roulette gameplay is very similar. "
	},
	{
		"insert": "\n\n"
	},
	{
		"attributes": {
			"background": "transparent",
			"color": "#000000"
		},
		"insert": "Live dealer roulette works just like the classic game played in brick-and-mortar casinos: you can watch the dealer interact with the wheel and the table for your peace of mind. Connecting with a professional, glamorous dealer creates a more authentic experience, too."
	},
	{
		"insert": "\n\n\n"
	}
]