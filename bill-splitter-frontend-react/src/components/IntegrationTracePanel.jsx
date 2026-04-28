import { CheckCircle2, Circle } from 'lucide-react'

function TraceRow({ done, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      {done ? <CheckCircle2 size={15} color="#1f8f4b" /> : <Circle size={15} color="#9aa4b2" />}
      <span style={{ fontSize: '12px', color: done ? '#1f8f4b' : '#5f6c84', fontWeight: 600 }}>
        {label}
      </span>
    </div>
  )
}

function IntegrationTracePanel({ trace }) {
  if (!trace) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: 78,
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid #d8e3f5',
        borderRadius: '12px',
        padding: '10px',
        zIndex: 1200,
        boxShadow: '0 8px 20px rgba(12,31,71,0.18)'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 800, color: '#1A5FB4', marginBottom: '8px' }}>
        Integration Trace
      </div>
      <TraceRow done={trace.posEventCreated} label='POS event created' />
      <TraceRow done={trace.eventPublished} label='Event published (pos.receipt.created)' />
      <TraceRow done={trace.appReceived} label='TNG app received event' />
      <TraceRow done={trace.receiptRendered} label='Receipt rendered in customer UI' />

      {(trace.eventId || trace.transactionId) && (
        <div style={{ marginTop: '8px', borderTop: '1px solid #eef2fa', paddingTop: '7px' }}>
          {trace.eventId && (
            <div style={{ fontSize: '11px', color: '#6b778e' }}>
              event_id: <span style={{ fontFamily: 'monospace' }}>{trace.eventId}</span>
            </div>
          )}
          {trace.transactionId && (
            <div style={{ fontSize: '11px', color: '#6b778e' }}>
              transaction_id: <span style={{ fontFamily: 'monospace' }}>{trace.transactionId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IntegrationTracePanel
