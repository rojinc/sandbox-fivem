import { documentationData } from '../data/documentationData';
import SystemPage from '../components/SystemPage';

export default function CrimeSystem() {
  return <SystemPage data={documentationData.crimeSystem} />;
}
