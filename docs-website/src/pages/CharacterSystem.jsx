import { documentationData } from '../data/documentationData';
import SystemPage from '../components/SystemPage';

export default function CharacterSystem() {
  return <SystemPage data={documentationData.characterSystem} />;
}
