import { documentationData } from '../data/documentationData';
import CodeBlock from '../components/CodeBlock';
import { FiCheckCircle } from 'react-icons/fi';

export default function CoreFramework() {
  const { coreFramework } = documentationData;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title">{coreFramework.title}</h1>
        <p className="doc-description">Essential core systems that power the framework</p>
        <div className="doc-meta">
          <span className="badge">{coreFramework.resources.length} Core Resources</span>
        </div>
      </div>

      {coreFramework.resources.map((resource, idx) => (
        <div key={idx} className="doc-section">
          <div className="resource-card">
            <div className="resource-header">
              <div>
                <h2 className="resource-title">{resource.name}</h2>
                <div className="resource-path">{resource.path}</div>
              </div>
              <span className="badge">{resource.category}</span>
            </div>

            <p className="resource-description">{resource.description}</p>

            {resource.features && (
              <>
                <h4>Features</h4>
                <ul className="features-list">
                  {resource.features.map((feature, fIdx) => (
                    <li key={fIdx} className="feature-item">
                      <FiCheckCircle className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {resource.structure && (
              <>
                <h4>Structure</h4>
                <div className="feature-tags">
                  {resource.structure.map((item, sIdx) => (
                    <span key={sIdx} className="feature-tag">{item}</span>
                  ))}
                </div>
              </>
            )}

            {resource.exports && (
              <>
                <h3>Exports</h3>
                {resource.exports.map((exp, eIdx) => (
                  <div key={eIdx} className="export-section">
                    <div className="export-name">{exp.name}()</div>
                    <div className="export-description">{exp.description}</div>
                    {exp.returns && <p><strong>Returns:</strong> <code>{exp.returns}</code></p>}
                    {exp.params && <p><strong>Parameters:</strong> <code>{exp.params.join(', ')}</code></p>}
                    {exp.example && (
                      <div className="code-example">
                        <span className="code-label">Example:</span>
                        <CodeBlock code={exp.example} language="lua" />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {resource.events && (
              <>
                <h3>Events</h3>
                {resource.events.map((event, evIdx) => (
                  <div key={evIdx} className="export-section">
                    <div className="export-name">{event.name}</div>
                    <span className="badge">{event.type}</span>
                    <div className="export-description">{event.description}</div>
                    {event.example && (
                      <div className="code-example">
                        <span className="code-label">Example:</span>
                        <CodeBlock code={event.example} language="lua" />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {resource.implementation && (
              <>
                <h4>Implementation</h4>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{resource.implementation}</pre>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
