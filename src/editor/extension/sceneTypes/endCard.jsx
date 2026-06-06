import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, GRADIENTS, FONTS, TYPE, WEIGHT, RADIUS, SHADOW, SPACE, LEADING, TRACKING } from '../lib/tokens';
import { SPRING, useCanvasScale, AnimatedEntry, AnimatedWords } from '../lib/motion';
import { Fields, TextField, ColorField, SelectField, NumberField } from '../lib/fields';

const BG = {
  solid: COLORS.ink,
  scrim: GRADIENTS.scrimBottom,
  none: 'transparent',
};

const avatarLetter = (handle) => {
  const cleaned = String(handle ?? '').replace(/^@+/, '').trim();
  return (cleaned.charAt(0) || '?').toUpperCase();
};

const EndCardRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    headline = 'Follow for more',
    handle = '@yourchannel',
    cta = 'Subscribe',
    accent = COLORS.accent,
    background = 'solid',
    exitFrames = 0,
  } = props;

  const exit = exitFrames > 0
    ? interpolate(frame, [durationFrames - exitFrames, durationFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const avatarSize = 150 * s;
  const pulse = (Math.sin(frame * 0.12) + 1) / 2;
  const ringScale = interpolate(pulse, [0, 1], [1, 1.45]);
  const ringOpacity = interpolate(pulse, [0, 1], [0.5, 0]);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      {background !== 'none' && (
        <AbsoluteFill style={{ background: BG[background] ?? BG.solid }} />
      )}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: `${SPACE.xxl * s}px ${SPACE.safe * s}px`,
          fontFamily: FONTS.display,
        }}
      >
        <AnimatedEntry from="none" scaleFrom={0.6} config={SPRING.bouncy}>
          <div
            style={{
              position: 'relative',
              width: avatarSize,
              height: avatarSize,
              marginBottom: SPACE.lg * s,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: RADIUS.pill,
                border: `${4 * s}px solid ${accent}`,
                transform: `scale(${ringScale})`,
                opacity: ringOpacity,
              }}
            />
            <div
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: RADIUS.pill,
                background: accent,
                color: COLORS.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: TYPE.display * s,
                fontWeight: WEIGHT.black,
                letterSpacing: TRACKING.tight,
                boxShadow: SHADOW.glow,
              }}
            >
              {avatarLetter(handle)}
            </div>
          </div>
        </AnimatedEntry>

        <div
          style={{
            fontSize: TYPE.h1 * s,
            fontWeight: WEIGHT.black,
            color: COLORS.paper,
            lineHeight: LEADING.tight,
            letterSpacing: TRACKING.tight,
            maxWidth: '88%',
            display: 'flex',
            justifyContent: 'center',
            textShadow: '0 4px 30px rgba(0,0,0,0.55)',
          }}
        >
          <AnimatedWords text={headline} delay={6} perItem={2.4} from="up" distance={24 * s} />
        </div>

        <AnimatedEntry from="up" distance={18 * s} delay={16} config={SPRING.gentle}>
          <div
            style={{
              fontSize: TYPE.title * s,
              fontWeight: WEIGHT.medium,
              color: COLORS.paperDim,
              marginTop: SPACE.sm * s,
            }}
          >
            {handle}
          </div>
        </AnimatedEntry>

        <AnimatedEntry from="up" distance={20 * s} delay={26} scaleFrom={0.7} config={SPRING.bouncy}>
          <div
            style={{
              marginTop: SPACE.xl * s,
              padding: `${SPACE.md * s}px ${SPACE.xl * s}px`,
              borderRadius: RADIUS.pill,
              background: accent,
              color: COLORS.paper,
              fontSize: TYPE.title * s,
              fontWeight: WEIGHT.bold,
              letterSpacing: TRACKING.wide,
              boxShadow: SHADOW.glow,
            }}
          >
            {cta}
          </div>
        </AnimatedEntry>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndCardProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <TextField label="Headline" value={props.headline} onChange={set('headline')} />
      <TextField label="Handle" value={props.handle} onChange={set('handle')} />
      <TextField label="CTA" value={props.cta} onChange={set('cta')} />
      <ColorField label="Accent" value={props.accent} onChange={set('accent')} />
      <SelectField label="Background" value={props.background} onChange={set('background')} options={['solid', 'scrim', 'none']} />
      <NumberField label="Exit frames" value={props.exitFrames} onChange={set('exitFrames')} step={1} min={0} max={60} />
    </Fields>
  );
};

export default {
  id: 'endCard',
  label: 'End Card',
  category: 'sceneType',
  defaultProps: {
    headline: 'Follow for more',
    handle: '@yourchannel',
    cta: 'Subscribe',
    accent: '#7C5CFF',
    background: 'solid',
    exitFrames: 0,
  },
  RemotionComponent: EndCardRender,
  PropertiesEditor: EndCardProps,
};
