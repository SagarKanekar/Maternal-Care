type Sample = {
  ts_ms?: string;
  Sensor_data?: {
    AD8232?: { ecgHrBpm?: number };
    FSR?: { fsrAU?: number };
    INMP441?: { respBpm?: number };
    MAX30105?: { maxSpO2?: number };
  };
};

type WindowDoc = {
  id: string;
  windowStartTs?: string;
  windowEndTs?: string;
  samples?: Sample[];
};

function sampleSummary(s?: Sample) {
  if (!s) return "—";
  const hr = s.Sensor_data?.AD8232?.ecgHrBpm ?? "–";
  const uc = s.Sensor_data?.FSR?.fsrAU ?? "–";
  const resp = s.Sensor_data?.INMP441?.respBpm ?? "–";
  const spo2 = s.Sensor_data?.MAX30105?.maxSpO2 ?? "–";
  return `HR:${hr} | FSR:${uc} | Resp:${resp} | SpO₂:${spo2}`;
}

export function WindowAccordion({ logs }: { logs: WindowDoc[] }) {
  if (!logs.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
        No windows found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, idx) => (
        <details
          key={log.id}
          open={idx === 0}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">Window {log.id}</div>
              <div className="text-xs text-gray-500">
                {log.windowStartTs ?? "?"} → {log.windowEndTs ?? "?"}
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Samples: {log.samples?.length ?? 0}
            </div>
          </summary>

          <div className="mt-3 space-y-2 text-xs text-gray-700">
            {(log.samples ?? []).slice(0, 5).map((s, i) => (
              <div key={i} className="rounded border border-gray-100 bg-gray-50 px-2 py-1">
                <div className="flex justify-between">
                  <span className="font-mono text-[11px] text-gray-500">
                    {s.ts_ms ?? "ts"}
                  </span>
                  <span>{sampleSummary(s)}</span>
                </div>
              </div>
            ))}

            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">View raw JSON</summary>
              <pre className="mt-1 max-h-64 overflow-auto rounded bg-gray-900 p-2 text-[11px] text-gray-100">
{JSON.stringify(log, null, 2)}
              </pre>
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}