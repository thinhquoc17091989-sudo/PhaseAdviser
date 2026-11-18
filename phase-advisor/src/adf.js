const BLOCK_NODES = new Set([
  'blockquote', 'bulletList', 'codeBlock', 'heading', 'listItem',
  'orderedList', 'panel', 'paragraph', 'rule', 'table', 'tableCell',
  'tableHeader', 'tableRow',
]);

export function adfToText(document, maximumLength = 1500) {
  if (!document) return '';
  if (typeof document === 'string') return truncate(document, maximumLength);

  const text = readNode(document).replace(/\n{3,}/g, '\n\n').trim();
  return truncate(text, maximumLength);
}

function readNode(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';

  const content = Array.isArray(node.content) ? node.content.map(readNode).join('') : '';
  return BLOCK_NODES.has(node.type) ? `${content}\n` : content;
}

export function truncate(value, maximumLength) {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, maximumLength - 1)}…`;
}
