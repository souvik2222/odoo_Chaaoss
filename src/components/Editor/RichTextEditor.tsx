import React, { useRef, useState, useMemo, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = "",
}) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Insert emoji at cursor position
  const insertEmoji = (emoji: any) => {
    const editor = quillRef.current?.getEditor();
    const range = editor?.getSelection();
    if (range) {
      editor.insertText(range.index, emoji.native);
      editor.setSelection(range.index + emoji.native.length);
    }
    setShowEmojiPicker(false);
  };

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#toolbar",
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  // Attach click listener to emoji button
  useEffect(() => {
    const emojiBtn = document.getElementById("emoji-btn");
    const toggle = () => setShowEmojiPicker((prev) => !prev);

    emojiBtn?.addEventListener("click", toggle);
    return () => {
      emojiBtn?.removeEventListener("click", toggle);
    };
  }, []);

  return (
    <div
      className={`rich-text-editor ${className}`}
      style={{ position: "relative" }}
    >
      {/* 🔧 Custom Toolbar */}
      <div id="toolbar">
        <select className="ql-header" defaultValue="">
          <option value="1" />
          <option value="2" />
          <option value="3" />
          <option value="" />
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <select className="ql-align" />
        <button className="ql-link" />
        <button className="ql-image" />
        <button type="button" id="emoji-btn" className="ql-emoji">
          😄
        </button>
        <button className="ql-clean" />
      </div>

      {/* 📝 Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: "200px",
          marginBottom: "42px",
        }}
      />

      {/* 😄 Emoji Picker */}
      {showEmojiPicker && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          <Picker data={emojiData} onEmojiSelect={insertEmoji} />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
