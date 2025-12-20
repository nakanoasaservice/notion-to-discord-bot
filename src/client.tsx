import { render } from "hono/jsx/dom";

export default function App() {
	return (
		<div>
			<h1>Notion to Discord Bot</h1>
		</div>
	);
}

const root = document.getElementById("root");
if (root) {
	render(<App />, root);
}
