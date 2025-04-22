/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Tree } from './Tree';

export interface FileExplorerProps {
  content: Record<string, any>;
  data: {
    sources: string[];
    sourcesContent: string[];
  };
}

export function FileExplorer({ content, data }: FileExplorerProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFileSelect = (key: string) => {
    const i = data.sources.findIndex((source) => source === key);
    const code = data.sourcesContent[i];
    editorRef.current.setValue(code ?? "//No Content Found");
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
