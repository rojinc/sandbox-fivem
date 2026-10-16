import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRoot, createNuiStore, NuiBridge, Panel, PanelHeader, Button, Kbd, Tag, ProgressBar, Icon, RichText, useNuiEvent, fetchNui } from '@sandbox/ui-kit';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const demo = (state = { n: 0 }, action) => (action.type === 'PING' ? { n: state.n + 1 } : state);
const store = createNuiStore({ demo });

function App() {
  useNuiEvent('PING', (d) => console.log('ping', d));
  return (
    <Box sx={{ p: 4, width: 420 }}>
      <Panel>
        <PanelHeader icon={['fas','gauge-high']} title="Smoke test" subtitle="kit renders" actions={<Button tone="ghost" icon="xmark">Close</Button>} />
        <Typography variant="body2">Press <Kbd>E</Kbd> to interact. <Tag tone="success" icon="circle-check">OK</Tag></Typography>
        <ProgressBar value={42} label="Hunger" valueLabel="42%" sx={{ mt: 2 }} />
        <RichText text="{key}G{/key} <b>Open</b> trunk" />
        <Icon icon={['fad','circle-x']} /> <Icon icon="fa-solid fa-house" /> <Icon icon={['far','money-bill-alt']} />
        <Button tone="primary" icon="check" onClick={() => fetchNui('Test', {a:1})} sx={{ mt: 2 }}>Primary</Button>
      </Panel>
    </Box>
  );
}
createRoot(document.getElementById('app')).render(<Provider store={store}><NuiBridge><AppRoot><App /></AppRoot></NuiBridge></Provider>);
