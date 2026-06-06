import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, TYPE, WEIGHT, RADIUS, SHADOW, SPACE } from '../lib/tokens';
import { SPRING, useSpringValue, useCanvasScale, AnimatedEntry, exitFade } from '../lib/motion';
import { Fields, TextField, NumberField, ColorField } from '../lib/fields';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const CalloutRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    label = 'Label',
    x = 50,
    y = 35,
    dx = 16,
    dy = -14,
    color = COLORS.cyan,
    exitFrames = 12,
  } = props;

  const draw = clamp01(useSpringValue(0, SPRING.snappy));
  const len = Math.hypot(dx, dy);
  const dash = len + 0.0001;

  const pulse = (Math.sin(frame * 0.16) + 1) / 2;
  const pulseR = 1.4 + pulse * 2.6;
  const pulseOpacity = (1 - pulse) * 0.5;

  const exit = exitFade(frame, durationFrames, exitFrames);

  const ex = x + dx;
  const ey = y + dy;
  const labelTransform =
    dx >= 0
      ? `translate(${SPACE.xs * s}px, -50%)`
      : `translate(calc(-100% - ${SPACE.xs * s}px), -50%)`;

  return (
    <AbsoluteFill style={{ opacity: exit, pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <line
          x1={x}
          y1={y}
          x2={ex}
          y2={ey}
          stroke={color}
          strokeWidth={0.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeDasharray={dash}
          strokeDashoffset={dash * (1 - draw)}
        />
        <circle cx={x} cy={y} r={pulseR} fill={color} opacity={pulseOpacity} />
        <circle cx={x} cy={y} r={0.9} fill={color} />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: `${ex}%`,
          top: `${ey}%`,
          transform: labelTransform,
        }}
      >
        <AnimatedEntry delay={6} from="none" config={SPRING.snappy}>
          <div
            style={{
              padding: `${SPACE.xs * s}px ${SPACE.sm * s}px`,
              background: COLORS.inkPanel,
              border: `1px solid ${COLORS.line}`,
              borderRadius: RADIUS.md * s,
              boxShadow: SHADOW.soft,
              backdropFilter: 'blur(10px)',
              fontFamily: FONTS.body,
              fontSize: TYPE.label * s,
              fontWeight: WEIGHT.semibold,
              color: COLORS.paper,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        </AnimatedEntry>
      </div>
    </AbsoluteFill>
  );
};

const CalloutProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <TextField label="Label" value={props.label} onChange={set('label')} />
      <NumberField label="Anchor X" value={props.x} onChange={set('x')} step={1} min={0} max={100} />
      <NumberField label="Anchor Y" value={props.y} onChange={set('y')} step={1} min={0} max={100} />
      <NumberField label="Offset X" value={props.dx} onChange={set('dx')} step={1} min={-50} max={50} />
      <NumberField label="Offset Y" value={props.dy} onChange={set('dy')} step={1} min={-50} max={50} />
      <ColorField label="Color" value={props.color} onChange={set('color')} />
      <NumberField label="Exit frames" value={props.exitFrames} onChange={set('exitFrames')} step={1} min={0} max={60} />
    </Fields>
  );
};

export default {
  id: 'callout',
  label: 'Callout',
  category: 'overlay',
  defaultProps: {
    label: 'Label',
    x: 50,
    y: 35,
    dx: 16,
    dy: -14,
    color: '#3BE3D0',
    exitFrames: 12,
  },
  RemotionComponent: CalloutRender,
  PropertiesEditor: CalloutProps,
};
