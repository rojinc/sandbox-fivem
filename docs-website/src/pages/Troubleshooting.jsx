import { documentationData } from '../data/documentationData';
import { FiAlertCircle } from 'react-icons/fi';

export default function Troubleshooting() {
  const { troubleshooting } = documentationData;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title">{troubleshooting.title}</h1>
        <p className="doc-description">Solutions to common issues and debugging tips</p>
      </div>

      {troubleshooting.sections.map((section, idx) => (
        <div key={idx} className="doc-section">
          <h2>{section.title}</h2>

          {section.problems && section.problems.map((problem, pIdx) => (
            <div key={pIdx} className="resource-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <FiAlertCircle style={{ color: 'var(--warning)', fontSize: '1.5rem' }} />
                <h4 style={{ margin: 0 }}>{problem.issue}</h4>
              </div>
              <h5>Solutions:</h5>
              <ul>
                {problem.solutions.map((solution, sIdx) => (
                  <li key={sIdx}>{solution}</li>
                ))}
              </ul>
            </div>
          ))}

          {section.content && (
            <div className="card">
              <pre style={{ whiteSpace: 'pre-wrap', background: 'transparent', border: 'none', padding: 0, color: 'var(--text-secondary)' }}>
                {section.content}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
