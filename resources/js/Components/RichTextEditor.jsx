// File: resources/js/Components/RichTextEditor.jsx

import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({
    value = '',
    onChange,
    placeholder = 'Enter text...',
    height = '150px',
    error = null,
    className = ''
}) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const isUpdating = useRef(false);

    useEffect(() => {
        if (!editorRef.current) return;

        // Initialize Quill
        const quill = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: placeholder,
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link'],
                    ['clean']
                ]
            },
            formats: [
                'header', 'bold', 'italic', 'underline', 'strike',
                'color', 'background', 'list', 'bullet', 'align', 'link'
            ]
        });

        quillRef.current = quill;

        // Set initial content
        if (value && !isUpdating.current) {
            quill.root.innerHTML = value;
        }

        // Handle text changes
        quill.on('text-change', () => {
            if (isUpdating.current) return;

            const html = quill.root.innerHTML;
            const isEmpty = quill.getText().trim().length === 0;

            if (onChange) {
                onChange(isEmpty ? '' : html);
            }
        });

        // Custom styles for editor height
        editorRef.current.querySelector('.ql-editor').style.minHeight = height;

        return () => {
            if (quillRef.current) {
                quillRef.current.off('text-change');
            }
        };
    }, []);

    // Update content when value prop changes
    useEffect(() => {
        if (quillRef.current && value !== quillRef.current.root.innerHTML) {
            isUpdating.current = true;
            quillRef.current.root.innerHTML = value || '';
            isUpdating.current = false;
        }
    }, [value]);

    return (
        <div className={`rich-text-editor ${className}`}>
            <div
                ref={editorRef}
                className={`bg-white border rounded-md ${error ? 'border-red-300' : 'border-gray-300'
                    } focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500`}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default RichTextEditor;
