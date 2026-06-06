import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, GRADIENTS, FONTS, TYPE, WEIGHT, TRACKING, LEADING, RADIUS, SPACE } from '../lib/tokens';
import { SPRING, useSpringValue, useCanvasScale, AnimatedWords, exitFade } from '../lib/motion';
import { Fields, TextField, NumberField, RangeField, ColorField, SelectField } from '../lib/fields';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const PLACEMENT = {
  center: { justifyContent: 'center', alignItems: 'center' },
  lower: { justifyContent: 'flex-end', alignItems: 'center' },
  upper: { justifyContent: 'flex-start', alignItems: 'center' },
  'lower-left': { justifyContent: 'flex-end', alignItems: 'flex-start' },
  'upper-left': { justifyContent: 'flex-start', alignItems: 'flex-start' },
};

const ANIMATION = {
  rise: { from: 'up', config: SPRING.snappy },
  fall: { from: 'down', config: SPRING.snappy },
  pop: { from: 'none', config: SPRING.bouncy },
};

const KineticTextRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    text = 'Your headline',
    position = 'lower',
    size = 'display',
    color = COLORS.paper,
    highlight = COLORS.accent,
    highlightStyle = 'underline',
    animation = 'rise',
    uppercase = false,
    scrim = 0.0,
    exitFrames = 12,
  } = props;

  const anim = ANIMATION[animation] ?? ANIMATION.rise;
  const fontSize = (TYPE[size] ?? TYPE.display) * s;
  const barProgress = clamp01(useSpringValue(8, SPRING.gentle));
  const exit = exitFade(frame, durationFrames, exitFrames);

  const isBox = highlightStyle === 'box';
  const isUnderline = highlightStyle === 'underline';

  return (
    <AbsoluteFill style={{ opacity: exit, pointerEvents: 'none' }}>
      {scrim > 0 ? (
        <AbsoluteFill style={{ background: GRADIENTS.scrimBottom, opacity: clamp01(scrim) }} />
      ) : null}
      <AbsoluteFill
        style={{
          display: 'flex',
          padding: SPACE.safe * s,
          ...(PLACEMENT[position] ?? PLACEMENT.lower),
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'inherit',
            padding: isBox ? `${10 * s}px ${22 * s}px` : 0,
            borderRadius: isBox ? RADIUS.md * s : 0,
          }}
        >
          {isBox ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: RADIUS.md * s,
                background: highlight,
                opacity: 0.22,
              }}
            />
          ) : null}
          <AnimatedWords
            text={text}
            from={anim.from}
            config={anim.config}
            distance={28 * s}
            perItem={3}
            style={{
              position: 'relative',
              justifyContent: 'inherit',
              fontFamily: FONTS.display,
              fontSize,
              fontWeight: WEIGHT.black,
              color,
              letterSpacing: TRACKING.tight,
              lineHeight: LEADING.tight,
              textTransform: uppercase ? 'uppercase' : 'none',
              textShadow: '0 2px 18px rgba(8,10,16,0.55)',
            }}
          />
          {isUnderline ? (
            <div
              style={{
                position: 'relative',
                height: 8 * s,
                marginTop: 8 * s,
                width: `${barProgress * 100}%`,
                borderRadius: RADIUS.pill * s,
                background: highlight,
              }}
            />
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const KineticTextProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <TextField label="Text" value={props.text} onChange={set('text')} />
      <SelectField
        label="Position"
        value={props.position}
        onChange={set('position')}
        options={['center', 'lower', 'upper', 'lower-left', 'upper-left']}
      />
      <SelectField
        label="Size"
        value={props.size}
        onChange={set('size')}
        options={['display', 'h1', 'h2', 'title']}
      />
      <ColorField label="Color" value={props.color} onChange={set('color')} />
      <ColorField label="Highlight" value={props.highlight} onChange={set('highlight')} />
      <SelectField
        label="Highlight style"
        value={props.highlightStyle}
        onChange={set('highlightStyle')}
        options={['none', 'underline', 'box']}
      />
      <SelectField
        label="Animation"
        value={props.animation}
        onChange={set('animation')}
        options={['rise', 'fall', 'pop']}
      />
      <SelectField
        label="Uppercase"
        value={String(props.uppercase)}
        onChange={(v) => onChange({ ...props, uppercase: v === 'true' })}
        options={[
          { value: 'false', label: 'no' },
          { value: 'true', label: 'yes' },
        ]}
      />
      <RangeField label="Scrim" value={props.scrim} onChange={set('scrim')} step={0.05} min={0} max={0.8} />
      <NumberField label="Exit frames" value={props.exitFrames} onChange={set('exitFrames')} step={1} min={0} max={60} />
    </Fields>
  );
};

export default {
  id: 'kineticText',
  label: 'Kinetic Text',
  category: 'overlay',
  defaultProps: {
    text: 'Your headline',
    position: 'lower',
    size: 'display',
    color: '#F6F8FC',
    highlight: '#7C5CFF',
    highlightStyle: 'underline',
    animation: 'rise',
    uppercase: false,
    scrim: 0.0,
    exitFrames: 12,
  },
  RemotionComponent: KineticTextRender,
  PropertiesEditor: KineticTextProps,
};
