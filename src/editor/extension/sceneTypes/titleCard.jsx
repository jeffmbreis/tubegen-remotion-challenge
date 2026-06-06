import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, GRADIENTS, FONTS, TYPE, WEIGHT, TRACKING, LEADING, SPACE } from '../lib/tokens';
import { SPRING, useSpringValue, useCanvasScale, AnimatedEntry, AnimatedWords, ramp, exitFade } from '../lib/motion';
import { Fields, TextField, ColorField, SelectField, NumberField } from '../lib/fields';

const BG = {
  scrim: GRADIENTS.scrimBottom,
  solid: COLORS.ink,
  none: 'transparent',
};

const V_ALIGN = { center: 'center', bottom: 'flex-end', top: 'flex-start' };

const TitleCardRender = ({ props, ctx }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    kicker = '',
    title = 'Title',
    subtitle = '',
    align = 'center',
    vAlign = 'center',
    background = 'scrim',
    accent = COLORS.accent,
    titleColor = COLORS.paper,
    exitFrames = 16,
  } = props;

  const bgFade = ramp(frame, [0, 18], [0, 1]);
  const rule = useSpringValue(14, SPRING.snappy);
  const exit = exitFade(frame, durationFrames, exitFrames);
  const left = align === 'left';

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      {background !== 'none' && <AbsoluteFill style={{ background: BG[background] ?? BG.scrim, opacity: bgFade }} />}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: V_ALIGN[vAlign] ?? 'center',
          alignItems: left ? 'flex-start' : 'center',
          textAlign: left ? 'left' : 'center',
          padding: `${SPACE.xxl * s}px ${SPACE.safe * s}px`,
          fontFamily: FONTS.display,
        }}
      >
        {kicker ? (
          <AnimatedEntry from="up" distance={20 * s} config={SPRING.snappy}>
            <div
              style={{
                fontSize: TYPE.label * s,
                letterSpacing: TRACKING.caps,
                textTransform: 'uppercase',
                color: accent,
                fontWeight: WEIGHT.bold,
                marginBottom: SPACE.sm * s,
              }}
            >
              {kicker}
            </div>
          </AnimatedEntry>
        ) : null}

        <div
          style={{
            fontSize: TYPE.display * s,
            fontWeight: WEIGHT.black,
            color: titleColor,
            lineHeight: LEADING.tight,
            letterSpacing: TRACKING.tight,
            maxWidth: '88%',
            justifyContent: left ? 'flex-start' : 'center',
            display: 'flex',
            textShadow: '0 4px 30px rgba(0,0,0,0.55)',
          }}
        >
          <AnimatedWords text={title} delay={6} perItem={2.4} from="up" distance={26 * s} />
        </div>

        <div
          style={{
            height: 5 * s,
            width: interpolate(rule, [0, 1], [0, 120 * s]),
            background: GRADIENTS.accentSweep,
            borderRadius: 999,
            margin: `${SPACE.md * s}px 0`,
          }}
        />

        {subtitle ? (
          <AnimatedEntry from="up" distance={18 * s} delay={20} config={SPRING.gentle}>
            <div
              style={{
                fontSize: TYPE.title * s,
                fontWeight: WEIGHT.medium,
                color: COLORS.paperDim,
                lineHeight: LEADING.snug,
                maxWidth: '70%',
              }}
            >
              {subtitle}
            </div>
          </AnimatedEntry>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TitleCardProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <TextField label="Kicker" value={props.kicker} onChange={set('kicker')} />
      <TextField label="Title" value={props.title} onChange={set('title')} />
      <TextField label="Subtitle" value={props.subtitle} onChange={set('subtitle')} />
      <SelectField label="Align" value={props.align} onChange={set('align')} options={['center', 'left']} />
      <SelectField label="V-Align" value={props.vAlign} onChange={set('vAlign')} options={['center', 'bottom', 'top']} />
      <SelectField label="Background" value={props.background} onChange={set('background')} options={['scrim', 'solid', 'none']} />
      <ColorField label="Accent" value={props.accent} onChange={set('accent')} />
      <ColorField label="Title color" value={props.titleColor} onChange={set('titleColor')} />
      <NumberField label="Exit frames" value={props.exitFrames} onChange={set('exitFrames')} step={1} min={0} max={60} />
    </Fields>
  );
};

export default {
  id: 'titleCard',
  label: 'Title Card',
  category: 'sceneType',
  defaultProps: {
    kicker: '',
    title: 'Title',
    subtitle: '',
    align: 'center',
    vAlign: 'center',
    background: 'scrim',
    accent: COLORS.accent,
    titleColor: COLORS.paper,
    exitFrames: 16,
  },
  RemotionComponent: TitleCardRender,
  PropertiesEditor: TitleCardProps,
};
