import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Tree } from './Tree';

export function FileExplorer({ content, data }) {
    const editorRef = useRef(null);
  
    const handleEditorDidMount = (editor, monaco) => {
      editorRef.current = editor;
    };
  
    const handleFileSelect = (key) => {
      const i = data.sources.findIndex((i) => i === key);
      const code = data.sourcesContent[i];
      editorRef.current.setValue(code);
      editorRef.current.setScrollPosition({ scrollTop: 0 });
    };
  
    return (
      <>
        <div className="flex-container">
          <div className="flex-item">
            <Tree content={content} onSelect={handleFileSelect} />
          </div>
          <div className="flex-item">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={'// Select a file'}
              options={{
                readOnly: true,
              }}
              onMount={handleEditorDidMount}
            />
          </div>
        </div>
      </>
    );
  }
  