import { documentationData } from '../data/documentationData';

export default function DeveloperGuide() {
  const { developerGuide } = documentationData;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title">{developerGuide.title}</h1>
        <p className="doc-description">Learn how to create custom resources and extend the framework</p>
      </div>

      {developerGuide.sections.map((section, idx) => (
        <div key={idx} className="doc-section">
          <h2>{section.title}</h2>
          <div className="card">
            <pre style={{ whiteSpace: 'pre-wrap', background: 'transparent', border: 'none', padding: 0, color: 'var(--text-secondary)' }}>
              {section.content}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
