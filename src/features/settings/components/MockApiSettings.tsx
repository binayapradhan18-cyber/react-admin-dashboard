import { useState } from 'react';
import {
  getMockConfig,
  type MockConfig,
  setMockConfig,
  SIMULATED_ERROR_RATE,
} from '@/mocks/config';
import { Checkbox, SelectField } from '@/shared/ui';
import styles from './Settings.module.css';

const LATENCY_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '150', label: 'Fast (~150 ms)' },
  { value: '450', label: 'Realistic (~450 ms)' },
  { value: '1500', label: 'Slow (~1.5 s)' },
];

/** Developer controls for the MSW mock backend; changes apply to the next request. */
export function MockApiSettings() {
  const [config, setConfig] = useState<MockConfig>(getMockConfig);
  const apply = (patch: Partial<MockConfig>) => setConfig(setMockConfig(patch));

  return (
    <div className={styles.form}>
      <SelectField
        label="Network latency"
        options={LATENCY_OPTIONS}
        value={String(config.latencyMs)}
        onChange={(event) => apply({ latencyMs: Number(event.target.value) })}
      />
      <Checkbox
        label="Simulate server failures"
        description={`Roughly ${SIMULATED_ERROR_RATE * 100}% of data requests fail with a 500, to exercise error boundaries, retries and optimistic rollbacks.`}
        checked={config.errorRate > 0}
        onChange={(event) => apply({ errorRate: event.target.checked ? SIMULATED_ERROR_RATE : 0 })}
      />
    </div>
  );
}
