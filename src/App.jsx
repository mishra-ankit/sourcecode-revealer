import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Header,
  Content,
  Navbar,
  InputGroup,
  Loader,
  Button,
} from 'rsuite';
import {useHash} from 'react-use';
import prettyBytes from 'pretty-bytes';
import Input from 'rsuite/Input';

import { downloadCode, getSourceMaps, packFiles } from './util';

import { getList } from './service';
import { FileExplorer } from './FileExplorer/FileExplorer';
import FileDownload from '@rsuite/icons/FileDownload';

export default function App() {
  const [hash, setHash] = useHash();
  const [content, setContent] = useState();
  const inputURL = useRef(null);
  const [scriptList, setScriptList] = useState([]);
  const [url, setUrl] = useState('');
  const [data, setData] = useState();
  const [error, setError] = useState('');
  const [totalSize, setTotalSize] = useState(0);
  const [progress, setProgress] = useState('Loading ....');

  useEffect(() => {
    const cleandUpHash = hash.slice(1);
    inputURL.current.value = cleandUpHash;
    if (cleandUpHash !== url) {
      setUrl(cleandUpHash);
    }
  }, [hash]);

  const onSubmit = () => {
    reset();
    const value = inputURL.current.value;
    // if the url doesn't start with https or http, add https://
    if (!value.startsWith('https://') && !value.startsWith('http://')) {
      setUrl(`https://${value}`);
    } else {
      setUrl(value);
    }
  };

  useEffect(() => {
    setHash(url); // update hash
    reset();

    if (!url) return;

    getList(url).then((list) => {
      const scriptList = list;
      setScriptList(scriptList);
    });
  }, [url]);

  useEffect(() => {
    if (scriptList.length === 0) {
      // setError("No source map found");
      return;
    }
    
    const handleUpdate = (currentIndex) => {
      setTimeout(() => setProgress("Loading " + (currentIndex + 1) + "/" + scriptList.length), 0);
    };

    getSourceMaps(scriptList, handleUpdate).then(({ combinedSourceMap, error }) => {
      if (error) {
        setError(error);
        return;
      }
      setData(combinedSourceMap);
      const { sources } = combinedSourceMap;
      const baap = {};
      sources.map((path) => {
        const parts = path.split('/');
        let parent = baap;
        parts.forEach((part) => {
          parent[part] = parent[part] ? { ...parent[part] } : {};
          parent = parent[part];
        });
      });
      console.log({sources, baap, combinedSourceMap});
      setContent(baap);
    });
  }, [scriptList]);

  useEffect(() => {
    if (data) {
      packFiles(data.sources, data.sourcesContent).then((blob) => {
        setTotalSize(blob.size);
      });
    }
  }, [data]);

  return (
    <Container>
      <Header>
        <Navbar appearance="inverse">
          <Navbar.Header
            style={{
              padding: '1em',
            }}
          >
            <h4 className="navbar-brand logo">
              Is your source code revealing too much ?
            </h4>
          </Navbar.Header>
        </Navbar>
      </Header>
      <Content
        style={{
          padding: '1em',
        }}
      >
        <InputGroup
          style={{
            margin: '1em auto',
            width: '80%',
          }}
        >
          <Input
            list="url-suggestion"
            name="url"
            required
            ref={inputURL}
            placeholder="Enter application URL and I'll do the rest"
            type="url"
          />
          <datalist id="url-suggestion">
            <option>
              https://demos.creative-tim.com/material-dashboard-react
            </option>
            <option>https://my.replika.ai/</option>
            <option>https://vgtv.no</option>
          </datalist>
          <InputGroup.Button onClick={onSubmit}>Go</InputGroup.Button>
        </InputGroup>

        {scriptList.length > 0 && (
          <>
            <InputGroup
              style={{
                margin: '1em auto',
                width: '80%',
              }}
            >
              <Input
                as="textarea"
                disabled
                value={scriptList.join('\n')}
                rows={3}
                placeholder="Or enter scripts URLs here (one per line)"
              />
            </InputGroup>
            {totalSize > 0 && <Button appearance="primary"
              ripple={true}
              onClick={() =>
                downloadCode(data.sources, data.sourcesContent, url)
              }
            >
              Download Code ({prettyBytes(totalSize)})
              <FileDownload />
            </Button>}
          </>
        )}

        {error && <h4>{error}</h4>}

        {!error && url.length > 0 && !content && (
          <Loader backdrop={true} size="lg" content={progress} />
        )}

        {content && <FileExplorer content={content} data={data} />}
      </Content>
    </Container>
  );

  function reset() {
    setData();
    setScriptList([]);
    setError('');
    setContent();
    setTotalSize(0);
  }
}
