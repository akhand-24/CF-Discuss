import React, { useState } from 'react';

const CodeBlock = ({ code, language = 'cpp' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!code) return null;

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shadow-md">
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
        <span>{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-sm text-zinc-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
