import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore Runtime test import uses the source TS module directly.
import { ActionEngine, PlaybackEngine } from '../lib/family/deck-playback.ts';

const slides = [
  {
    id: 1,
    slideIndex: 0,
    title: 'Overview',
    actions: [
      { id: 11, actionIndex: 0 },
      { id: 12, actionIndex: 1 },
    ],
  },
  {
    id: 2,
    slideIndex: 1,
    title: 'Evidence',
    actions: [{ id: 21, actionIndex: 0 }],
  },
];

test('ActionEngine walks actions and slides in order', () => {
  const engine = new ActionEngine(slides);

  assert.deepEqual(engine.start(), {
    currentSlideIndex: 0,
    currentActionIndex: 0,
    playbackState: 'playing',
  });

  assert.deepEqual(engine.nextAction(), {
    currentSlideIndex: 0,
    currentActionIndex: 1,
    playbackState: 'playing',
  });

  assert.deepEqual(engine.nextAction(), {
    currentSlideIndex: 1,
    currentActionIndex: 0,
    playbackState: 'playing',
  });

  assert.deepEqual(engine.prevSlide(), {
    currentSlideIndex: 0,
    currentActionIndex: 0,
    playbackState: 'playing',
  });
});

test('PlaybackEngine supports pause, resume, stop, and restore', () => {
  const engine = new PlaybackEngine(slides);

  engine.start();
  engine.nextAction();

  assert.deepEqual(engine.pause(), {
    currentSlideIndex: 0,
    currentActionIndex: 1,
    playbackState: 'paused',
  });

  assert.deepEqual(engine.resume(), {
    currentSlideIndex: 0,
    currentActionIndex: 1,
    playbackState: 'playing',
  });

  const restored = engine.restore({
    currentSlideIndex: 1,
    currentActionIndex: 0,
    playbackState: 'paused',
  });

  assert.deepEqual(restored, {
    currentSlideIndex: 1,
    currentActionIndex: 0,
    playbackState: 'paused',
  });

  assert.deepEqual(engine.stop(), {
    currentSlideIndex: 1,
    currentActionIndex: 0,
    playbackState: 'stopped',
  });
});
