import { FiCheckCircle } from 'react-icons/fi';
import CodeBlock from './CodeBlock';

export default function SystemPage({ data }) {
  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title">{data.title}</h1>
        <div className="doc-meta">
          <span className="badge">{data.resources.length} Resources</span>
        </div>
      </div>

      {data.resources.map((resource, idx) => (
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
                <h4>Directory Structure</h4>
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

            {resource.database && (
              <>
                <h4>Database Tables</h4>
                <div className="feature-tags">
                  {resource.database.tables.map((table, tIdx) => (
                    <span key={tIdx} className="feature-tag">{table}</span>
                  ))}
                </div>
              </>
            )}

            {resource.jobTypes && (
              <>
                <h4>Job Types</h4>
                {resource.jobTypes.map((job, jIdx) => (
                  <div key={jIdx} className="card" style={{ marginBottom: '1rem' }}>
                    <h5>{job.name}</h5>
                    <p>{job.description}</p>
                    {job.ranks && (
                      <p><strong>Ranks:</strong> {job.ranks.join(', ')}</p>
                    )}
                  </div>
                ))}
              </>
            )}

            {resource.propertyTypes && (
              <>
                <h4>Property Types</h4>
                {resource.propertyTypes.map((prop, pIdx) => (
                  <div key={pIdx} className="card" style={{ marginBottom: '1rem' }}>
                    <h5>{prop.name}</h5>
                    <p>{prop.description}</p>
                    {prop.features && (
                      <div className="feature-tags">
                        {prop.features.map((f, fIdx) => (
                          <span key={fIdx} className="feature-tag">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {resource.apps && (
              <>
                <h4>Phone Applications</h4>
                <div className="stats-grid">
                  {resource.apps.map((app, aIdx) => (
                    <div key={aIdx} className="stat-card">
                      <div style={{ fontSize: '2rem' }}>{app.icon}</div>
                      <h5 style={{ margin: '0.5rem 0' }}>{app.name}</h5>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>{app.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
