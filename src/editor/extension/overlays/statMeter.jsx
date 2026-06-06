import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, TYPE, WEIGHT, TRACKING, RADIUS, SHADOW, SPACE } from '../lib/tokens';
import { SPRING, useSpringValue, useCanvasScale, AnimatedEntry, exitFade } from '../lib/motion';
import { Fields, TextField, NumberField, ColorField, SelectField } from '../lib/fields';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const ANCHOR = {
  'bottom-center': { justifyContent: 'flex-end', alignItems: 'center' },
  'bottom-left': { justifyContent: 'flex-end', alignItems: 'flex-start' },
  center: { justifyContent: 'center', alignItems: 'center' },
};

const StatMeterRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    label = 'METRIC',
    value = 30,
    max = 100,
    unit = '%',
    caption = '',
    color = COLORS.danger,
    anchor = 'bottom-center',
    exitFrames = 12,
  } = props;

  const fill = clamp01(useSpringValue(6, SPRING.gentle));
  const pct = clamp01(value / (max || 100)) * fill;
  const shown = Math.round(value * fill);
  const exit = exitFade(frame, durationFrames, exitFrames);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        padding: SPACE.safe * s,
        opacity: exit,
        pointerEvents: 'none',
        ...(ANCHOR[anchor] ?? ANCHOR['bottom-center']),
      }}
    >
      <AnimatedEntry from="up" distance={36 * s} config={SPRING.snappy}>
        <div
          style={{
            minWidth: 520 * s,
            maxWidth: '86%',
            padding: `${20 * s}px ${30 * s}px ${24 * s}px`,
            background: COLORS.inkPanel,
            border: `1px solid ${COLORS.line}`,
            borderRadius: RADIUS.lg * s,
            boxShadow: SHADOW.card,
            backdropFilter: 'blur(10px)',
            fontFamily: FONTS.body,
          }}
        >
          <div
            style={{
              fontSize: TYPE.label * s,
              letterSpacing: TRACKING.caps,
              color: COLORS.paperDim,
              fontWeight: WEIGHT.semibold,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 * s, margin: `${6 * s}px 0 ${16 * s}px` }}>
            <span
              style={{
                fontSize: TYPE.display * s,
                fontWeight: WEIGHT.black,
                color: COLORS.paper,
                lineHeight: 1,
                letterSpacing: TRACKING.tight,
              }}
            >
              {shown}
            </span>
            <span style={{ fontSize: TYPE.h2 * s, fontWeight: WEIGHT.bold, color }}>{unit}</span>
          </div>

          <div
            style={{
              position: 'relative',
              height: 14 * s,
              borderRadius: 999,
              background: 'rgba(246,248,252,0.12)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${pct * 100}%`,
                borderRadius: 999,
                background: color,
                boxShadow: `0 0 ${20 * s}px ${color}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${pct * 100}%`,
                width: 26 * s,
                height: 26 * s,
                marginLeft: -13 * s,
                marginTop: -13 * s,
                borderRadius: 999,
                background: COLORS.paper,
                border: `${3 * s}px solid ${color}`,
                boxShadow: SHADOW.soft,
              }}
            />
          </div>

          {caption ? (
            <div style={{ marginTop: 14 * s, fontSize: TYPE.caption * s, color: COLORS.paperDim }}>{caption}</div>
          ) : null}
        </div>
      </AnimatedEntry>
    </AbsoluteFill>
  );
};

const StatMeterProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <TextField label="Label" value={props.label} onChange={set('label')} />
      <NumberField label="Value" value={props.value} onChange={set('value')} step={1} />
      <NumberField label="Max" value={props.max} onChange={set('max')} step={1} min={1} />
      <TextField label="Unit" value={props.unit} onChange={set('unit')} />
      <TextField label="Caption" value={props.caption} onChange={set('caption')} />
      <ColorField label="Color" value={props.color} onChange={set('color')} />
      <SelectField
        label="Anchor"
        value={props.anchor}
        onChange={set('anchor')}
        options={['bottom-center', 'bottom-left', 'center']}
      />
      <NumberField label="Exit frames" value={props.exitFrames} onChange={set('exitFrames')} step={1} min={0} max={60} />
    </Fields>
  );
};

export default {
  id: 'statMeter',
  label: 'Stat Meter',
  category: 'overlay',
  defaultProps: {
    label: 'THREAT THRESHOLD',
    value: 30,
    max: 100,
    unit: '%',
    caption: '',
    color: COLORS.danger,
    anchor: 'bottom-center',
    exitFrames: 12,
  },
  RemotionComponent: StatMeterRender,
  PropertiesEditor: StatMeterProps,
};
