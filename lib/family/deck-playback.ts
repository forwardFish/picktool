export type PlaybackSlide = {
  id: number;
  slideIndex: number;
  title: string;
  actions: Array<{
    id: number;
    actionIndex: number;
  }>;
};

export type PlaybackSnapshotState = {
  currentSlideIndex: number;
  currentActionIndex: number;
  playbackState: 'idle' | 'playing' | 'paused' | 'stopped';
};

export class ActionEngine {
  private slides: PlaybackSlide[];
  private currentSlideIndex = 0;
  private currentActionIndex = 0;
  private playbackState: PlaybackSnapshotState['playbackState'] = 'idle';

  constructor(slides: PlaybackSlide[]) {
    this.slides = [...slides].sort((left, right) => left.slideIndex - right.slideIndex);
  }

  start() {
    this.currentSlideIndex = 0;
    this.currentActionIndex = 0;
    this.playbackState = 'playing';
    return this.getSnapshot();
  }

  pause() {
    this.playbackState = 'paused';
    return this.getSnapshot();
  }

  resume() {
    this.playbackState = 'playing';
    return this.getSnapshot();
  }

  stop() {
    this.playbackState = 'stopped';
    this.currentActionIndex = 0;
    return this.getSnapshot();
  }

  nextAction() {
    const slide = this.slides[this.currentSlideIndex];
    if (!slide) {
      return this.getSnapshot();
    }

    const nextIndex = this.currentActionIndex + 1;
    if (nextIndex < slide.actions.length) {
      this.currentActionIndex = nextIndex;
    } else if (this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex += 1;
      this.currentActionIndex = 0;
    }

    return this.getSnapshot();
  }

  nextSlide() {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex += 1;
      this.currentActionIndex = 0;
    }
    return this.getSnapshot();
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex -= 1;
      this.currentActionIndex = 0;
    }
    return this.getSnapshot();
  }

  getSnapshot(): PlaybackSnapshotState {
    return {
      currentSlideIndex: this.currentSlideIndex,
      currentActionIndex: this.currentActionIndex,
      playbackState: this.playbackState,
    };
  }

  restore(snapshot: PlaybackSnapshotState) {
    this.currentSlideIndex = Math.max(0, Math.min(snapshot.currentSlideIndex, this.slides.length - 1));
    const slide = this.slides[this.currentSlideIndex];
    this.currentActionIndex = Math.max(
      0,
      Math.min(snapshot.currentActionIndex, Math.max((slide?.actions.length || 1) - 1, 0))
    );
    this.playbackState = snapshot.playbackState;
    return this.getSnapshot();
  }
}

export class PlaybackEngine {
  private actionEngine: ActionEngine;

  constructor(slides: PlaybackSlide[]) {
    this.actionEngine = new ActionEngine(slides);
  }

  start() {
    return this.actionEngine.start();
  }

  pause() {
    return this.actionEngine.pause();
  }

  resume() {
    return this.actionEngine.resume();
  }

  stop() {
    return this.actionEngine.stop();
  }

  nextAction() {
    return this.actionEngine.nextAction();
  }

  nextSlide() {
    return this.actionEngine.nextSlide();
  }

  prevSlide() {
    return this.actionEngine.prevSlide();
  }

  getSnapshot() {
    return this.actionEngine.getSnapshot();
  }

  restore(snapshot: PlaybackSnapshotState) {
    return this.actionEngine.restore(snapshot);
  }
}
