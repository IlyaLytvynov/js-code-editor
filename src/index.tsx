import 'bulmaswatch/superhero/bulmaswatch.min.css';
import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';
import CodeEditor from './components/code-editor';
import Preview from './components/preview';


const el = document.getElementById('root');

const root = ReactDOM.createRoot(el!);

const App = () => {
  const ref = useRef<any>();
  const [code, setCode] = useState('')
  const [input, setInput] = useState('');

 
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'esbuild.wasm',
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }
    

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    console.log(result);

    setCode(result.outputFiles[0].text);
   

    // eval(result.outputFiles[0].text);
  };
  
  return (
    <div>
    <CodeEditor
      initialValue="const a = 1;"
      onChange={(value) => setInput(value)}
    />
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
    ></textarea>
    <div>
      <button onClick={onClick}>Submit</button>
    </div>
    <Preview code={code}/>
  </div>
  );
};

root.render(<App />);


