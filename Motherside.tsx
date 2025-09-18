import React, { useCallback, useEffect, useRef, useState } from "react";

interface TreeNode {
  id: number;
  name: string;
  image: string;
  children: TreeNode[];
}

const NodeComp: React.FC<{
  node: TreeNode;
  onAdd: (parentId: number) => void;
  onUpdate: (id: number, name: string, image: string) => void;
}> = ({ node, onAdd, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [preview, setPreview] = useState(node.image);

  useEffect(() => {
    setEditName(node.name);
    setPreview(node.image);
  }, [node.name, node.image]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const nameToSave = editName.trim() || node.name;
    onUpdate(node.id, nameToSave, preview);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(node.name);
    setPreview(node.image);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="node-container">
      <div className="node">
        <img src={node.image} alt={node.name} className="node-img" />
        <button
          className="plus-btn"
          onClick={() => onAdd(node.id)}
          title="Add child"
        >
          +
        </button>
        <button
          className="edit-btn"
          onClick={() => setIsEditing((v) => !v)}
          title="Edit node"
        >
          ✎
        </button>
      </div>

      <div className="node-name">{node.name}</div>

      {isEditing && (
        <div className="edit-panel">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter name"
            className="edit-input"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <div className="preview-row">
            <img src={preview} alt="preview" className="preview-img" />
          </div>
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {node.children.length > 0 && (
        <div className="children">
          {node.children.map((child) => (
            <NodeComp
              key={child.id}
              node={child}
              onAdd={onAdd}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Motherside: React.FC = () => {
  const idRef = useRef(1);

  const defaultTree: TreeNode = {
    id: 1,
    name: "Root",
    image: `https://i.pravatar.cc/80?img=1`,
    children: [],
  };

  const loadTree = (): TreeNode => {
    const saved = localStorage.getItem("familyTreeMotherside");
    if (saved) {
      try {
        const parsed: TreeNode = JSON.parse(saved);
        const getMaxId = (n: TreeNode): number =>
          Math.max(n.id, ...n.children.map(getMaxId));
        idRef.current = getMaxId(parsed);
        return parsed;
      } catch {
        return defaultTree;
      }
    }
    return defaultTree;
  };

  const [tree, setTree] = useState<TreeNode>(loadTree);

  useEffect(() => {
    localStorage.setItem("familyTreeMotherside", JSON.stringify(tree));
  }, [tree]);

  const addChild = useCallback((parentId: number) => {
    const newId = ++idRef.current;
    const newNode: TreeNode = {
      id: newId,
      name: `Node ${newId}`,
      image: `https://i.pravatar.cc/80?img=${(newId % 70) + 1}`,
      children: [],
    };

    setTree((prev) => {
      const add = (n: TreeNode): TreeNode =>
        n.id === parentId
          ? { ...n, children: [...n.children, newNode] }
          : { ...n, children: n.children.map(add) };
      return add(prev);
    });
  }, []);

  const updateNode = useCallback((id: number, name: string, image: string) => {
    setTree((prev) => {
      const upd = (n: TreeNode): TreeNode =>
        n.id === id
          ? { ...n, name, image }
          : { ...n, children: n.children.map(upd) };
      return upd(prev);
    });
  }, []);

  const deleteNode = (id: number) => {
    setTree((prev) => {
      if (prev.id === id) {
        alert("Cannot delete root node");
        return prev;
      }
      const remove = (n: TreeNode): TreeNode | null => {
        if (n.id === id) return null;
        const filteredChildren = n.children
          .map(remove)
          .filter((c): c is TreeNode => c !== null);
        return { ...n, children: filteredChildren };
      };
      const result = remove(prev);
      return result ?? prev;
    });
  };

  const flatten = useCallback((root: TreeNode) => {
    const out: { id: number; name: string; image: string }[] = [];
    const dfs = (n: TreeNode) => {
      out.push({ id: n.id, name: n.name, image: n.image });
      n.children.forEach(dfs);
    };
    dfs(root);
    return out;
  }, []);

  const nodesList = flatten(tree);

  return (
    <div className="tree-wrapper">
      <div className="tree-area">
        <NodeComp node={tree} onAdd={addChild} onUpdate={updateNode} />
      </div>

      <aside className="sidebar">
        <h3>All Nodes</h3>
        <ul className="node-list">
          {nodesList.map((n) => (
            <li key={n.id} className="node-list-item">
              <div className="list-left">
                <img src={n.image} alt={n.name} className="list-thumb" />
                <span className="list-name">{n.name}</span>
              </div>
              <div className="list-right">
                <button
                  className="delete-btn"
                  onClick={() => deleteNode(n.id)}
                  title="Delete node"
                >
                  −
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="hint">
          Click ✎ on any node to edit name or upload a photo, then Save.
        </p>
      </aside>
    </div>
  );
};

export default Motherside;
