import React, { useEffect, useRef } from 'react';
import './preview.css';

interface IPreviewPros {
  code: string;
  err: null | string;
}

const html = `
    <html>
      <head>
        <style>
          html {
            background: #FFF;
          }
        </style>  
      </head>
      <body>
        <div id="root"></div>
        <script>
          const handleError = (err) => {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
            console.error(err);
          }

          window.addEventListener('error', (event) => {
            event.preventDefault();
            handleError(event.error);
          })

          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              handleError(err)
            }
          }, false);
        </script>
      </body>
    </html>
  `;

const Preview: React.FC<IPreviewPros> = ({ code, err }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(code, '*');
      }, 50)
    }
  }, [code]);

  return (
   <div className="preview-wrapper">
     <iframe
      style={{ backgroundColor: 'white' }}
      title='code preview'
      ref={iframeRef}
      sandbox='allow-scripts'
      srcDoc={html}
    />
    {err && <div className="preview-err">{err}</div>}
   </div>
  );
};

export default Preview;
