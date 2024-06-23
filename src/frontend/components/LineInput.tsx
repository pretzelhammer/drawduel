import { type FunctionalComponent, type JSX } from 'preact';
import classes from 'src/frontend/components/LineInput.module.css';

export interface LineInputProps {
	readonly placeholder: string;
	readonly value: string;
	readonly onInput: JSX.InputEventHandler<HTMLInputElement>;
}

export const LineInput: FunctionalComponent<LineInputProps> = (props) => {
	const { placeholder, value, onInput } = props;
	return (
		<>
			{value}
			<input type="text" value={value} placeholder={placeholder} onInput={onInput} />
			<div class={classes.line} />
		</>
	);
};
