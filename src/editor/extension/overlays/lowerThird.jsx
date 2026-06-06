import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, FONTS, TYPE, WEIGHT, LEADING, SPACE, RADIUS } from '../lib/tokens';
import { useCanvasScale, exitFade } from '../lib/motion';
import { Fields, TextField, ColorField, NumberField } from '../lib/fields';

const LowerThirdRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    title = 'Title',
    subtitle = '',
    backgroundColor = COLORS.inkPanel,
    textColor = COLORS.paper,
    accent = COLORS.accent,
    enterFrames = 12,
    exitFrames = 12,
  } = props;

  const enter = interpolate(frame, [0, Math.max(1, enterFrames)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(enter, exitFade(frame, durationFrames, exitFrames));
  const translateX = interpolate(enter, [0, 1], [-30 * s, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: SPACE.safe * s,
          bottom: SPACE.xl * s,
          padding: `${SPACE.sm * s}px ${SPACE.lg * s}px`,
          background: backgroundColor,
          color: textColor,
          fontFamily: FONTS.body,
          borderLeft: `${4 * s}px solid ${accent}`,
          borderRadius: RADIUS.sm * s,
          opacity,
          transform: `translateX(${translateX}px)`,
          maxWidth: '60%',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ fontSize: TYPE.title * s, fontWeight: WEIGHT.bold, lineHeight: LEADING.snug }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: TYPE.label * s, opacity: 0.85, marginTop: SPACE.xs * s }}>{subtitle}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const LowerThirdProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <TextField label="Title" value={props.title} onChange={set('title')} />
      <TextField label="Subtitle" value={props.subtitle} onChange={set('subtitle')} />
      <TextField label="Background" value={props.backgroundColor} onChange={set('backgroundColor')} />
      <ColorField label="Accent" value={props.accent} onChange={set('accent')} />
      <ColorField label="Text color" value={props.textColor} onChange={set('textColor')} />
      <NumberField label="Enter frames" value={props.enterFrames} onChange={set('enterFrames')} step={1} min={1} max={60} />
      <NumberField label="Exit frames" value={props.exitFrames} onChange={set('exitFrames')} step={1} min={0} max={60} />
    </Fields>
  );
};

export default {
  id: 'lowerThird',
  label: 'Lower Third',
  category: 'overlay',
  defaultProps: {
    title: 'Title',
    subtitle: '',
    backgroundColor: COLORS.inkPanel,
    textColor: COLORS.paper,
    accent: COLORS.accent,
    enterFrames: 12,
    exitFrames: 12,
  },
  RemotionComponent: LowerThirdRender,
  PropertiesEditor: LowerThirdProps,
};
