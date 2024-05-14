import 'bulmaswatch/superhero/bulmaswatch.min.css';

import { useState, useEffect, useRef } from 'react';

import CodeEditor from './code-editor';
import Preview from './preview';
import bundle from '../bundler';
import Resizable from './resizable';

const CodeCell = () => {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [err, setError] = useState<null|string>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const changeHandler = (value: string) => {
    setInput(value);
  };

  useEffect(() => {
    timeRef.current = setTimeout(async () => {
      const output = await bundle(input);
      if (output) {
        setCode(output.code);
        setError(output.err);
      }
    }, 2000);
    return () => {
      clearTimeout(timeRef.current as unknown as number);
    };
  }, [input]);

  return (
    <Resizable direction='vertical'>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
        <Resizable direction='horizontal'>
          <CodeEditor initialValue='const a = 1;' onChange={changeHandler} />
        </Resizable>
        <Preview code={code} err={err}/>
      </div>
    </Resizable>
  );
};

export default CodeCell;
