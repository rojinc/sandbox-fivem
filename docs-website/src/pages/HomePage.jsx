import { documentationData } from '../data/documentationData';
import { FiCheckCircle } from 'react-icons/fi';

export default function HomePage() {
  const { overview } = documentationData;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <h1 className="doc-title gradient-text">{overview.title}</h1>
        <p className="doc-description">{overview.description}</p>
        <div className="doc-meta">
          <span className="badge">Version {overview.version}</span>
          <span className="badge badge-success">77 Resources</span>
          <span className="badge badge-warning">FiveM</span>
        </div>
      </div>

      <div className="doc-section">
        <h2>Framework Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{overview.stats.resources}</div>
            <div className="stat-label">Total Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.stats.sandboxResources}</div>
            <div className="stat-label">Sandbox Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.stats.oxResources}</div>
            <div className="stat-label">OX Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.stats.maxPlayers}+</div>
            <div className="stat-label">Max Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.stats.codeLines}</div>
            <div className="stat-label">Lines of Code</div>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h2>Key Features</h2>
        <ul className="features-list">
          {overview.features.map((feature, idx) => (
            <li key={idx} className="feature-item">
              <FiCheckCircle className="feature-icon" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="doc-section">
        <h2>What is Sandbox RP?</h2>
        <div className="card">
          <p>
            Sandbox RP Framework v2.0 is a comprehensive roleplay framework for FiveM, built on a heavily
            modified version of the Mythic Framework. It provides everything you need to run a professional
            GTA V roleplay server with advanced features, robust security, and extensive customization options.
          </p>
          <p>
            The framework includes 63 custom resources covering characters, jobs, vehicles, properties,
            police systems, businesses, crime mechanics, and much more. It's designed for scalability,
            performance, and ease of development.
          </p>
        </div>
      </div>

      <div className="doc-section">
        <h2>Quick Links</h2>
        <div className="resource-grid">
          <div className="resource-card">
            <h3>Getting Started</h3>
            <p>Learn how to install and configure the framework for your server.</p>
            <a href="/getting-started" className="badge">Read More →</a>
          </div>
          <div className="resource-card">
            <h3>Core Framework</h3>
            <p>Understand the core systems that power the entire framework.</p>
            <a href="/core-framework" className="badge">Explore →</a>
          </div>
          <div className="resource-card">
            <h3>API Reference</h3>
            <p>Complete API documentation for all exports and functions.</p>
            <a href="/api-reference" className="badge">View API →</a>
          </div>
          <div className="resource-card">
            <h3>Developer Guide</h3>
            <p>Learn how to create custom resources and extend the framework.</p>
            <a href="/developer-guide" className="badge">Learn More →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
