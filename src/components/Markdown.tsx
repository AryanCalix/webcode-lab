import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LessonBlock } from './lessonBlocks';
import { parseLessonBlocks, parsePreviewBody, parseVisualRows } from './lessonBlocks';
import {
  Callout,
  CompareVisual,
  FlowVisual,
  PreviewVisual,
  type CalloutTone,
} from './LessonVisual';

function renderBlock(block: LessonBlock, index: number) {
  if (block.type === 'markdown') {
    return (
      <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
        {block.content}
      </ReactMarkdown>
    );
  }

  if (block.name === 'flow') {
    return <FlowVisual key={index} title={block.title} rows={parseVisualRows(block.body)} />;
  }

  if (block.name === 'compare') {
    return <CompareVisual key={index} title={block.title} rows={parseVisualRows(block.body)} />;
  }

  if (block.name === 'preview') {
    const preview = parsePreviewBody(block.body);
    return (
      <PreviewVisual
        key={index}
        title={block.title}
        html={preview.html}
        css={preview.css}
        js={preview.js}
      />
    );
  }

  return (
    <Callout
      key={index}
      tone={block.name as CalloutTone}
      title={block.title}
      body={block.body}
    />
  );
}

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  const blocks = parseLessonBlocks(children);

  return (
    <div className={`markdown-body ${className}`.trim()}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
