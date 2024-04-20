import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const el = document.getElementById('root');

const root = ReactDOM.createRoot(el!);

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState('');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
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
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
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

    // console.log(result);

    // setCode(result.outputFiles[0].text);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        result.outputFiles[0].text,
        '*'
      );
    }

    // eval(result.outputFiles[0].text);
  };
  const html = `
    <html>
    <head>
    </head>
    <body>
      <div id="root"></div>
      <script>
        window.addEventListener('message', (e) => {
          try {
            eval(e.data);
          } catch(e) {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red">' + e + '</div>';
            throw e
          }
        })
      </script>
    </body>
    </html>
  `;
  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <iframe ref={iframeRef} srcDoc={html} sandbox='allow-scripts'></iframe>
    </div>
  );
};

root.render(<App />);
