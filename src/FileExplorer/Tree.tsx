import { MouseEvent } from "react";

const hideClass = "hide-children";

interface TreeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
  parentPath?: string;
  onSelect?: (path: string) => void;
}

export function Tree({ content, parentPath = "", onSelect = () => {} }: TreeProps) {
  if (!content) return null;
  const keys = Object.keys(content);

  const handleClick = (
    e: MouseEvent<HTMLLIElement>,
    key: string,
    path: string
  ) => {
    const target = e.currentTarget; // Corrected to use currentTarget
    e.stopPropagation();

    const directoryContent = content[key];
    const isDirectory = !!Object.keys(directoryContent).length;
    if (!isDirectory) {
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

  return keys.map((key) => {
    const fileIconClass = "fiv-viv " + getFileIconLabel(key);
    const path = parentPath ? `${parentPath}/${key}` : key;
    return (
      <li
        className={hideClass}
        onClick={(e) => handleClick(e, key, path)}
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
  tsx: "ts",
};

function getFileIconLabel(fileName: string) {
  // File extension of interest are: html, htm, js, css, json, gif, jpg, jpeg, png, ico, md, txt
  // You can add more as you see fit
  fileName = fileName.toLowerCase();

  let ext =
    fileName.split(".").length > 1 ? fileName.split(".").pop() : "folder";
  if (fileName === "." || fileName === "..") {
    ext = "folder";
  }
  ext = translateMap[ext as keyof typeof translateMap] || ext;
  
  return `fiv-icon-${ext}`;
}
