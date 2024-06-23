import { ChangeEvent } from 'react';
import classes from 'src/frontend/components/LineInput.module.css';

export interface LineInputProps {
	readonly placeholder: string;
	readonly value: string;
	readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function LineInput(props: LineInputProps) {
	const { placeholder, value, onChange } = props;
	return (
		<>
			<input type="text" value={value} placeholder={placeholder} onChange={onChange} />
			<div className={classes.line} />
		</>
	);
}
