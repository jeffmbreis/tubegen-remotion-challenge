import { AbsoluteFill } from 'remotion';
import { COLORS, GRADIENTS, FONTS, TYPE, WEIGHT, TRACKING, LEADING, SPACE, RADIUS } from '../lib/tokens';
import { SPRING, useSpringValue, useCanvasScale, staggerDelay, AnimatedEntry } from '../lib/motion';
import { Fields, TextField, NumberField, ColorField, SelectField } from '../lib/fields';

const BG = {
  solid: COLORS.ink,
  scrim: GRADIENTS.scrimBottom,
  none: 'transparent',
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const HorizontalBar = ({ datum, index, max, unit, s }) => {
  const progress = clamp01(useSpringValue(staggerDelay(index, 4, 8), SPRING.gentle));
  const ratio = clamp01((datum.value ?? 0) / (max || 1));
  const shown = Math.round((datum.value ?? 0) * progress);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.lg * s, width: '100%' }}>
      <div
        style={{
          width: 360 * s,
          flexShrink: 0,
          fontSize: TYPE.title * s,
          fontWeight: WEIGHT.medium,
          color: COLORS.paperDim,
          letterSpacing: TRACKING.normal,
          lineHeight: LEADING.snug,
          textAlign: 'right',
        }}
      >
        {datum.label}
      </div>
      <div
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          height: 26 * s,
          borderRadius: RADIUS.pill * s,
          background: 'rgba(246,248,252,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${ratio * progress * 100}%`,
            borderRadius: RADIUS.pill * s,
            background: datum.color,
            boxShadow: `0 0 ${24 * s}px ${datum.color}`,
          }}
        />
      </div>
      <div
        style={{
          width: 200 * s,
          flexShrink: 0,
          fontSize: TYPE.h2 * s,
          fontWeight: WEIGHT.bold,
          color: datum.color,
          letterSpacing: TRACKING.tight,
        }}
      >
        {shown}
        {unit}
      </div>
    </div>
  );
};

const VerticalBar = ({ datum, index, max, unit, s }) => {
  const progress = clamp01(useSpringValue(staggerDelay(index, 4, 8), SPRING.gentle));
  const ratio = clamp01((datum.value ?? 0) / (max || 1));
  const shown = Math.round((datum.value ?? 0) * progress);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        gap: SPACE.md * s,
      }}
    >
      <div
        style={{
          fontSize: TYPE.h2 * s,
          fontWeight: WEIGHT.bold,
          color: datum.color,
          letterSpacing: TRACKING.tight,
        }}
      >
        {shown}
        {unit}
      </div>
      <div
        style={{
          position: 'relative',
          width: 96 * s,
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          borderRadius: RADIUS.lg * s,
          background: 'rgba(246,248,252,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${ratio * progress * 100}%`,
            borderRadius: RADIUS.lg * s,
            background: datum.color,
            boxShadow: `0 0 ${24 * s}px ${datum.color}`,
          }}
        />
      </div>
      <div
        style={{
          maxWidth: 220 * s,
          fontSize: TYPE.title * s,
          fontWeight: WEIGHT.medium,
          color: COLORS.paperDim,
          lineHeight: LEADING.snug,
          textAlign: 'center',
        }}
      >
        {datum.label}
      </div>
    </div>
  );
};

const BarChartRender = ({ props }) => {
  const s = useCanvasScale();
  const {
    title = 'Metric comparison',
    data = [],
    max = 100,
    unit = '%',
    orientation = 'horizontal',
    background = 'solid',
  } = props;
  const vertical = orientation === 'vertical';

  return (
    <AbsoluteFill style={{ background: BG[background] ?? BG.solid }}>
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: SPACE.safe * s,
          fontFamily: FONTS.display,
        }}
      >
        <AnimatedEntry from="up" distance={28 * s} config={SPRING.snappy}>
          <div
            style={{
              fontSize: TYPE.h1 * s,
              fontWeight: WEIGHT.black,
              color: COLORS.paper,
              letterSpacing: TRACKING.tight,
              lineHeight: LEADING.tight,
              textAlign: 'center',
              marginBottom: SPACE.xl * s,
            }}
          >
            {title}
          </div>
        </AnimatedEntry>

        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'row' : 'column',
            alignItems: vertical ? 'stretch' : 'stretch',
            justifyContent: 'center',
            gap: (vertical ? SPACE.xl : SPACE.lg) * s,
            width: '100%',
            maxWidth: 1400 * s,
            height: vertical ? 560 * s : 'auto',
          }}
        >
          {data.map((datum, index) =>
            vertical ? (
              <VerticalBar key={index} datum={datum} index={index} max={max} unit={unit} s={s} />
            ) : (
              <HorizontalBar key={index} datum={datum} index={index} max={max} unit={unit} s={s} />
            )
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BarChartProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  const data = props.data ?? [];
  const setRow = (index, key) => (value) =>
    onChange({
      ...props,
      data: data.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    });
  const removeRow = (index) =>
    onChange({ ...props, data: data.filter((_, i) => i !== index) });
  const addRow = () =>
    onChange({
      ...props,
      data: data.concat({ label: 'New bar', value: 50, color: COLORS.accent }),
    });

  return (
    <Fields>
      <TextField label="Title" value={props.title} onChange={set('title')} />
      <NumberField label="Max" value={props.max} onChange={set('max')} step={1} min={1} max={1000} />
      <TextField label="Unit" value={props.unit} onChange={set('unit')} />
      <SelectField
        label="Orientation"
        value={props.orientation}
        onChange={set('orientation')}
        options={['horizontal', 'vertical']}
      />
      <SelectField
        label="Background"
        value={props.background}
        onChange={set('background')}
        options={['solid', 'scrim', 'none']}
      />
      {data.map((row, index) => (
        <div key={index}>
          <TextField label={`Bar ${index + 1} label`} value={row.label} onChange={setRow(index, 'label')} />
          <NumberField label="Value" value={row.value} onChange={setRow(index, 'value')} step={1} />
          <ColorField label="Color" value={row.color} onChange={setRow(index, 'color')} />
          <button className="pp-remove" onClick={() => removeRow(index)}>
            Remove bar
          </button>
        </div>
      ))}
      <button className="pp-remove" onClick={addRow}>
        Add bar
      </button>
    </Fields>
  );
};

export default {
  id: 'barChart',
  label: 'Bar Chart',
  category: 'sceneType',
  defaultProps: {
    title: 'Metric comparison',
    data: [
      { label: 'Series A', value: 80, color: '#3BE3D0' },
      { label: 'Series B', value: 65, color: '#7C5CFF' },
      { label: 'Series C', value: 30, color: '#FF5470' },
    ],
    max: 100,
    unit: '%',
    orientation: 'horizontal',
    background: 'solid',
  },
  RemotionComponent: BarChartRender,
  PropertiesEditor: BarChartProps,
};
