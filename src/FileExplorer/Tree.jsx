import React from "react";

const hideClass = "hide-children";

export function Tree({ content, parentPath = "", onSelect = () => {} }) {
  if (!content) return null;
  const keys = Object.keys(content);

  const handleClick = (e, x, key, path) => {
    const target = e.target; // li.current[x].
    e.stopPropagation();
    const name = key;

    const directoryContent = content[key];
    // TODO: Bad logic, what about empty folder ?
    const isDirectory = !!Object.keys(directoryContent).length;
    if (!isDirectory) {
      console.log("LOAD FILE CONTENT");
      console.log(path);
      onSelect(path);
      return;
    }

    const classList = target.classList;
    if (classList.contains(hideClass)) {
      classList.remove(hideClass);
    } else {
      classList.add(hideClass);
    }
  };

  return keys.map((key, x) => {
    const fileIconClass = "fiv-viv " + getFileIconLabel(key);
    const path = parentPath ? `${parentPath}/${key}` : key;
    return (
      <li
        className={hideClass}
        onClick={e => handleClick(e, x, key, path)}
        key={key}
        d-p={path}
      >
        <span className={fileIconClass}></span>
        {key}
        <Tree
          content={content[key]}
          key={key}
          parentPath={path}
          onSelect={onSelect}
        />
      </li>
    );
  });
}

const translateMap = {
    'tsx' : 'ts'
}

function getFileIconLabel(fileName, isDirectory = false) {
  // File extension of interest are: html, htm, js, css, json, gif, jpg, jpeg, png, ico, md, txt
  // You can add more as you see fit
  fileName = fileName.toLowerCase();

  let ext =
    fileName.split(".").length > 1 ? fileName.split(".").pop() : "folder";
  if (fileName === "." || fileName === "..") {
    ext = "folder";
  }
  
  ext = translateMap[ext] ?? ext; 
  
  return `fiv-icon-${ext}`;
}
