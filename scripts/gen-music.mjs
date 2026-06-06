import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = 'public/demo/assets/soundtrack.mp3';
const TARGET_SECONDS = 37.0;
const BASE = 'https://api.kie.ai/api/v1';
const KEY = process.env.KIE_API_KEY;

mkdirSync('public/demo/assets', { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const masterFromTemp = () => {
  const fadeOutStart = (TARGET_SECONDS - 2.5).toFixed(2);
  execSync(
    `ffmpeg -v error -y -i /tmp/tg_music_raw.mp3 -t ${TARGET_SECONDS} ` +
      `-af "afade=t=in:st=0:d=1.2,afade=t=out:st=${fadeOutStart}:d=2.5,loudnorm=I=-20:TP=-2" ` +
      `-ar 44100 -ac 2 -b:a 192k "${OUT}"`,
    { stdio: 'inherit' }
  );
};

const synthFallback = () => {
  console.log('No KIE_API_KEY (or generation failed) — synthesizing a local ambient bed with ffmpeg.');
  const fadeOutStart = (TARGET_SECONDS - 2.5).toFixed(2);
  execSync(
    `ffmpeg -v error -y ` +
      `-f lavfi -i "sine=frequency=55:duration=${TARGET_SECONDS}" ` +
      `-f lavfi -i "sine=frequency=82.41:duration=${TARGET_SECONDS}" ` +
      `-f lavfi -i "sine=frequency=164.81:duration=${TARGET_SECONDS}" ` +
      `-f lavfi -i "anoisesrc=d=${TARGET_SECONDS}:color=brown:amplitude=0.3" ` +
      `-filter_complex "[0]volume=0.5,tremolo=f=0.18:d=0.6[a];[1]volume=0.32[b];[2]volume=0.16[c];` +
      `[3]lowpass=f=520,volume=0.22[d];[a][b][c][d]amix=inputs=4:normalize=0,` +
      `aecho=0.8:0.7:55:0.3,lowpass=f=2200,afade=t=in:st=0:d=2,afade=t=out:st=${fadeOutStart}:d=2.5,` +
      `loudnorm=I=-20:TP=-2" ` +
      `-ar 44100 -ac 2 -b:a 192k "${OUT}"`,
    { stdio: 'inherit' }
  );
  console.log('wrote', OUT, '(synthesized fallback)');
};

const generateWithKie = async () => {
  const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const body = {
    customMode: true,
    instrumental: true,
    model: 'V4_5',
    title: 'Nightwatch Underscore',
    style:
      'cinematic ambient underscore, dark and mysterious, nocturnal, slow tempo, soft sub-bass pulse, ' +
      'gentle heartbeat, airy pads, subtle suspense, documentary explainer bed, minimal, no drums, hopeful resolve',
    prompt:
      'A quiet, suspenseful instrumental bed for a nighttime explainer about dogs: low warm drone, soft pulsing ' +
      'synth heartbeat, distant shimmer, restrained and atmospheric so a voiceover sits clearly on top.',
    negativeTags: 'vocals, lyrics, harsh distortion, aggressive drums, EDM drop',
    callBackUrl: 'https://example.com/callback',
  };

  console.log('Requesting music generation from kie.ai…');
  const res = await fetch(`${BASE}/generate`, { method: 'POST', headers, body: JSON.stringify(body) });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`generate failed: ${json.code} ${json.msg}`);
  const { taskId } = json.data;
  console.log('taskId:', taskId);

  let audioUrl = null;
  for (let i = 0; i < 60 && !audioUrl; i++) {
    const r = await fetch(`${BASE}/generate/record-info?taskId=${encodeURIComponent(taskId)}`, { headers });
    const j = await r.json();
    const status = j?.data?.status;
    process.stdout.write(`\rstatus: ${status}   (${i * 5}s)`);
    if (status === 'SUCCESS' || status === 'FIRST_SUCCESS') {
      const tracks = j.data.response?.sunoData ?? [];
      audioUrl = (tracks.find((t) => t.audioUrl) ?? tracks[0])?.audioUrl ?? null;
    } else if (String(status).includes('FAILED') || String(status).includes('ERROR')) {
      throw new Error(`generation failed: ${status}`);
    }
    if (!audioUrl) await sleep(5000);
  }
  if (!audioUrl) throw new Error('timed out waiting for music');

  console.log('\naudioUrl:', audioUrl);
  const raw = Buffer.from(await (await fetch(audioUrl)).arrayBuffer());
  writeFileSync('/tmp/tg_music_raw.mp3', raw);
  masterFromTemp();
  console.log('wrote', OUT);
};

if (!KEY) {
  synthFallback();
} else {
  try {
    await generateWithKie();
  } catch (err) {
    console.error('\nkie.ai generation failed:', err.message);
    synthFallback();
  }
}
