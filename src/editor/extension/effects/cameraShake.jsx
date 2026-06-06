import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useCanvasScale } from '../lib/motion';
import { Fields, NumberField, SelectField } from '../lib/fields';

const TAU = Math.PI * 2;

const CameraShakeRender = ({ props, ctx, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { durationFrames } = ctx;
  const s = useCanvasScale();
  const {
    amplitude = 9,
    frequency = 2.4,
    rotation = 0.5,
    mode = 'handheld',
    decay = 3.5,
    zoom = 1.04,
  } = props;

  const t = frame / fps;
  const w = t * frequency * TAU;
  const envelope = mode === 'impact' ? Math.exp(-decay * (frame / Math.max(1, durationFrames - 1)) * 4) : 1;

  const x = amplitude * s * envelope * (Math.sin(w) * 0.6 + Math.sin(w * 1.7 + 1.3) * 0.4);
  const y = amplitude * s * envelope * (Math.cos(w * 0.9 + 0.7) * 0.6 + Math.sin(w * 2.3 + 2.1) * 0.4);
  const rot = rotation * envelope * Math.sin(w * 0.8 + 0.4);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom}) translate(${x}px, ${y}px) rotate(${rot}deg)`,
        transformOrigin: '50% 50%',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const CameraShakeProps = ({ props, onChange }) => {
  const set = (k) => (v) => onChange({ ...props, [k]: v });
  return (
    <Fields>
      <SelectField label="Mode" value={props.mode} onChange={set('mode')} options={['handheld', 'impact']} />
      <NumberField label="Amplitude" value={props.amplitude} onChange={set('amplitude')} step={1} min={0} max={60} />
      <NumberField label="Frequency" value={props.frequency} onChange={set('frequency')} step={0.1} min={0.2} max={8} />
      <NumberField label="Rotation (°)" value={props.rotation} onChange={set('rotation')} step={0.1} min={0} max={4} />
      <NumberField label="Decay" value={props.decay} onChange={set('decay')} step={0.5} min={0.5} max={10} />
      <NumberField label="Zoom" value={props.zoom} onChange={set('zoom')} step={0.01} min={1} max={1.2} />
    </Fields>
  );
};

export default {
  id: 'cameraShake',
  label: 'Camera Shake',
  category: 'effect',
  defaultProps: {
    amplitude: 9,
    frequency: 2.4,
    rotation: 0.5,
    mode: 'handheld',
    decay: 3.5,
    zoom: 1.04,
  },
  RemotionComponent: CameraShakeRender,
  PropertiesEditor: CameraShakeProps,
};
