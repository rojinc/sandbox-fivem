import { documentationData } from '../data/documentationData';
import SystemPage from '../components/SystemPage';

export default function UISystem() {
  return <SystemPage data={documentationData.uiSystem} />;
}
