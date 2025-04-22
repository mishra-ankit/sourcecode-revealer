const CORS_PROXY: string = import.meta.env.REACT_APP_CORS_PROXY ?? "https://cors-baba.fly.dev/";

const getURLWithProxy = (url: string): string => CORS_PROXY + url;
const corsFetch = (url: string, ...rest: [RequestInit?]): Promise<Response> => fetch(getURLWithProxy(url), ...rest);

async function getSource(url: string): Promise<Record<string, unknown>> {
  try {
    const d = await getSourceMap(url);
    return d;
  } catch {
    throw new Error('Map file not found');
  }
}

async function getList(reqUrl: string): Promise<string[]> {
  return (await getAllScripts(reqUrl)).map((url: string) => {
    const isAbsoluteURL =
      url.startsWith('https://') || url.startsWith('http://');
    const { origin } = new URL(reqUrl);
    return isAbsoluteURL ? url : new URL(url, origin).href;
  });
}

async function getSourceMap(sourceUrl: string): Promise<Record<string, unknown>> {
  const mapUrl = sourceUrl.replace(".js", ".js.map");
  const mapRawContent = await corsFetch(mapUrl).then((r) => r.json());
  return mapRawContent;
}

async function getAllScripts(url: string): Promise<string[]> {
  const content = await (await corsFetch(url).then((r) => r.text()));
  const scriptURLList = getScriptTagsURL(content);
  let chunkNames: string[] = [];
  const inlineScripts = getAllInlineScripts(content);
  // iterate on inlineScripts
  for (let i = 0; i < inlineScripts.length; i++) {
    const inlineScript = inlineScripts[i];
    const chunkList = await getChunkList(inlineScript);
    chunkNames = [...chunkNames, ...chunkList];
  }

  return [...scriptURLList, ...chunkNames];
}

async function getChunkList(text: string): Promise<string[]> {
  const result: string[] = [];
  // split at ".chunk.css"
  // first part will have CSS chunks
  // second part will have JS chunks
  // use regex - to get chunk list
  const splitStr = '.chunk.css';
  const parts = text.split(splitStr);
  if (parts.length !== 2) {
    return result;
  }

  // const cssChunks = getChunkNames(parts[0], 'static/css/', '.chunk.css'); // commenting out for now, as very low success rate, and mostly lib content is returned
  const jsChunks = getChunkNames(parts[1], 'static/js/', '.chunk.js');

  return [...jsChunks];
}

function getChunkNames(text: string, prefix: string, postfix: string): string[] {
  const regex = /\(\d?\d\):"(.*?)"/gm;
  const result: string[] = [];
  const matches = text.matchAll(regex);

  const list: string[][] = [];
  for (const match of matches) {
    const index = parseInt(match[1]);
    if (list[index]) {
      list[index].push(match[2]);
    } else {
      list[index] = [match[2]];
    }
  }

  // unnamed one need to use index as prefix
  const names = list.map((arr, index) => {
    if (arr.length === 2) {
      return arr.join('.');
    } else {
      return [index, arr[0]].join('.');
    }
  });

  names.forEach((i) => {
    result.push(`${prefix}${i}${postfix}`);
  });

  return result;
}

function getScriptTagsURL(content: string): string[] {
  const scripts = getScriptTags(content);
  const ownOrigin = location.origin;
  return scripts.map((i) => i.src.replace(ownOrigin, '')).filter((i) => i);
}

function getScriptTags(content: string): HTMLScriptElement[] {
  const dom = htmlToElement(`<div>${content}</div>`);
  const scripts = Array.from(
    dom.getElementsByTagName('script')
  ) as HTMLScriptElement[];
  return scripts;
}

function getAllInlineScripts(content: string): string[] {
  return getScriptTags(content)
    .filter((i) => i.src === '')
    .map((i) => i.innerHTML);
}

function htmlToElement(html: string): HTMLElement {
  const template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

export { getSource, getList };
