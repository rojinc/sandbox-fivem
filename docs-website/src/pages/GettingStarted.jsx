import { documentationData } from '../data/documentationData';
import CodeBlock from '../components/CodeBlock';

export default function GettingStarted() {
  const { gettingStarted } = documentationData;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title">{gettingStarted.title}</h1>
        <p className="doc-description">Complete guide to installing and configuring Sandbox RP Framework</p>
      </div>

      {gettingStarted.sections.map((section, idx) => (
        <div key={idx} className="doc-section">
          <h2>{section.title}</h2>
          <div className="card">
            <pre style={{ whiteSpace: 'pre-wrap', background: 'transparent', border: 'none', padding: 0 }}>
              {section.content}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
