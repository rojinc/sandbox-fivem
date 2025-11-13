import { documentationData } from '../data/documentationData';
import CodeBlock from '../components/CodeBlock';

export default function APIReference() {
  const { apiReference } = documentationData;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title">{apiReference.title}</h1>
        <p className="doc-description">Complete API documentation for all framework exports and functions</p>
      </div>

      {apiReference.sections.map((section, sIdx) => (
        <div key={sIdx} className="doc-section">
          <h2>{section.title}</h2>
          {section.description && <p>{section.description}</p>}

          {section.functions.map((func, fIdx) => (
            <div key={fIdx} className="export-section">
              <div className="export-name">{func.name}</div>
              <div className="export-description">{func.description}</div>
              {func.signature && (
                <div style={{ marginTop: '0.5rem' }}>
                  <code style={{ background: 'var(--bg-tertiary)', padding: '0.5rem 1rem', display: 'block', borderRadius: 'var(--radius)' }}>
                    {func.signature}
                  </code>
                </div>
              )}
              {func.returns && <p><strong>Returns:</strong> {func.returns}</p>}
              {func.example && (
                <div className="code-example">
                  <span className="code-label">Example Usage:</span>
                  <CodeBlock code={func.example} language="lua" />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
