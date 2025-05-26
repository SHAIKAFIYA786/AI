import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SyntaxHighlightedCode = ({ className, children }) => {
  const language = className?.replace('lang-', '') || 'javascript';

  return (
    <SyntaxHighlighter language={language} style={oneDark}>
      {children}
    </SyntaxHighlighter>
  );
};

export default SyntaxHighlightedCode;
