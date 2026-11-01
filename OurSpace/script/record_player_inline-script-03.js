(() => {
  'use strict';

  if(new URLSearchParams(location.search).get('public')==='1'||(new URLSearchParams(location.search).get('page')||'profile')!=='profile')return;
  const player = document.getElementById('retroPlayer');if(!player)return;
  const audio = document.getElementById('audioElement');
  const picker = document.getElementById('audioPicker');
  const loadButton = document.getElementById('loadButton');
  const previousButton = document.getElementById('previousButton');
  const rewindButton = document.getElementById('rewindButton');
  const playButton = document.getElementById('playButton');
  const forwardButton = document.getElementById('forwardButton');
  const nextButton = document.getElementById('nextButton');
  const playIcon = document.getElementById('playIcon');
  const artistValue = document.getElementById('artistValue');
  const titleValue = document.getElementById('titleValue');
  const currentTime = document.getElementById('currentTime');
  const durationTime = document.getElementById('durationTime');
  const status = document.getElementById('playerStatus');
  const waveformFrame = document.getElementById('waveformFrame');
  const waveformSeek = document.getElementById('waveformSeek');
  const canvas = document.getElementById('waveformCanvas');

  const DEFAULT_TRACKS = [{ id:'create-in-defiance', src:'../../assets/audio/shared/record_player_create-in-defiance.mp3', title:'Create In Defiance', artist:'Unknown Artist', album:'Modern Day Addictions', durationSeconds:296.04, originalFilename:'Create In Defiance.mp3', kind:'bundled-track' }];

  // Embedded MP3 bytes are decoded lazily and reused throughout this session.
  const embeddedAudioCache = new Map();
  function embeddedAudioUrl(source) {
    const key = source.slice('embedded:'.length);
    let blob = embeddedAudioCache.get(key);
    if (!blob) {
      const pack = document.getElementById('packed-' + key);
      if (!pack) throw new Error('Embedded track missing: ' + key);
      const base64 = pack.textContent.trim();
      const chunks = [];
      for (let offset = 0; offset < base64.length; offset += 65536) {
        const binary = atob(base64.slice(offset, offset + 65536));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; ++i) bytes[i] = binary.charCodeAt(i);
        chunks.push(bytes);
      }
      blob = new Blob(chunks, { type: 'audio/mpeg' });
      embeddedAudioCache.set(key, blob);
    }
    return URL.createObjectURL(blob);
  }

  const state = {
    tracks: [],
    index: -1,
    objectUrl: null,
    lastStatus: '',
    loadingToken: 0,
    bundledCount: 0
  };

  // Keep browser-native playback for linked tracks hosted without CORS headers.
  // MediaElementSource can make those cross-origin tracks silent.
  const webAudioSafe = false;

  const engine = new window.RetroAudioEngine(audio, canvas, {
    barCount: 86,
    minFrequency: 45,
    maxFrequency: 16000,
    smoothing: 0.78,
    attack: 0.48,
    release: 0.14,
    webAudioEnabled: webAudioSafe
  });

  player.dataset.visualizerMode = engine.mode;

  function setStatus(message) {
    if (message === state.lastStatus) return;
    state.lastStatus = message;
    status.textContent = message;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function resolveTrackSource(src) {
    try {
      return new URL(src, document.baseURI).href;
    } catch (_) {
      return src;
    }
  }

  function revokeCurrentUrl() {
    if (!state.objectUrl) return;
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  function updateControls() {
    const hasTrack = state.index >= 0 && state.tracks.length > 0;
    playButton.disabled = !hasTrack;
    rewindButton.disabled = !hasTrack;
    forwardButton.disabled = !hasTrack;
    previousButton.disabled = !hasTrack || state.tracks.length < 2;
    nextButton.disabled = !hasTrack || state.tracks.length < 2;
    waveformSeek.disabled = !hasTrack;
  }

  function updatePlayState() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    playIcon.textContent = playing ? 'Ⅱ' : '▶';
    playButton.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playButton.setAttribute('aria-pressed', String(playing));
    player.dataset.visualizerMode = engine.mode;
  }

  function updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !('MediaMetadata' in window) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || '',
        artist: track.artist || '',
        album: track.album || ''
      });
      navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing';
    } catch (error) {
      console.warn('Media Session metadata could not be set:', error);
    }
  }

  function setTrackText(track) {
    artistValue.textContent = track?.artist || 'Unknown Artist';
    titleValue.textContent = track?.title || 'Untitled';
    artistValue.title = artistValue.textContent;
    titleValue.title = titleValue.textContent;
  }

  function resetAudioSource() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    revokeCurrentUrl();
  }

  async function loadTrack(index, autoplay = false) {
    if (!state.tracks.length) return;

    const token = ++state.loadingToken;
    state.index = (index + state.tracks.length) % state.tracks.length;
    const track = state.tracks[state.index];

    resetAudioSource();

    if (track.file) {
      state.objectUrl = URL.createObjectURL(track.file);
      audio.src = state.objectUrl;
    } else if (track.src && track.src.startsWith('embedded:')) {
      try {
        state.objectUrl = embeddedAudioUrl(track.src);
        audio.src = state.objectUrl;
      } catch (error) {
        setStatus('Unable to load embedded audio: ' + error.message);
        console.warn(error);
        return;
      }
    } else {
      audio.src = resolveTrackSource(track.src);
    }

    setTrackText(track);
    currentTime.textContent = '00:00';
    durationTime.textContent = Number.isFinite(track.durationSeconds)
      ? formatTime(track.durationSeconds)
      : '00:00';

    audio.load();
    updateControls();
    updatePlayState();
    updateMediaSession(track);
    setStatus(`Loaded ${track.title} by ${track.artist}.`);

    if (autoplay) {
      const startWhenReady = () => {
        if (token !== state.loadingToken) return;
        playAudio();
      };
      audio.addEventListener('canplay', startWhenReady, { once: true });
    }
  }

  async function tracksFromFiles(fileList) {
    const files = Array.from(fileList || []).filter((file) => {
      return file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|oga|flac|webm)$/i.test(file.name);
    });

    const tracks = [];
    for (const file of files) {
      const meta = await window.RetroRecordMetadata.readFileMetadata(file);
      tracks.push({
        id: `local-${window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
        file,
        sourceKey: `${file.name}:${file.size}:${file.lastModified}`,
        artist: meta.artist || 'Unknown Artist',
        title: meta.title || file.name,
        album: meta.album || '',
        year: meta.year || '',
        kind: 'local-file'
      });
    }
    return tracks;
  }

  async function addFiles(fileList) {
    const audioTracks = await tracksFromFiles(fileList);
    if (!audioTracks.length) {
      setStatus('No supported audio files were selected.');
      return;
    }

    const existingKeys = new Set(state.tracks.map((track) => track.sourceKey).filter(Boolean));
    const fresh = audioTracks.filter((track) => !existingKeys.has(track.sourceKey));

    if (!fresh.length) {
      setStatus('Those local audio files are already in this session playlist.');
      picker.value = '';
      return;
    }

    const firstNewIndex = state.tracks.length;
    state.tracks.push(...fresh);
    await loadTrack(firstNewIndex, false);
    picker.value = '';
    setStatus(`${fresh.length} local audio file${fresh.length === 1 ? '' : 's'} added; ${state.tracks.length} tracks total.`);
  }

  async function playAudio() {
    if (state.index < 0) {
      picker.click();
      return;
    }

    // Native media playback keeps cross-origin profile links audible.
    if (webAudioSafe) await engine.resume();

    try {
      await audio.play();
      player.dataset.visualizerMode = engine.mode;
    } catch (error) {
      const detail = error?.name ? ` (${error.name})` : '';
      setStatus(`Playback was blocked or unavailable${detail}. Press Play again.`);
      console.warn('Playback error:', error);
    }
  }

  function togglePlay() {
    if (audio.paused || audio.ended) playAudio();
    else audio.pause();
  }

  function skipBy(seconds) {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds));
  }

  function changeTrack(delta) {
    if (!state.tracks.length) return;
    const wasPlaying = !audio.paused && !audio.ended;
    loadTrack(state.index + delta, wasPlaying);
  }

  function seekFromPointer(event) {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const rect = waveformFrame.getBoundingClientRect();
    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    if (!Number.isFinite(clientX)) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  }

  function sanitizeManifestTracks(tracks) {
    return tracks
      .filter((track) => track && typeof track.src === 'string' && track.src.trim())
      .map((track, index) => ({
        id: track.id || `bundled-${index}`,
        src: track.src,
        artist: track.artist || 'Unknown Artist',
        title: track.title || track.originalFilename || `Track ${index + 1}`,
        album: track.album || '',
        year: track.year || '',
        durationSeconds: Number.isFinite(track.durationSeconds) ? track.durationSeconds : undefined,
        originalFilename: track.originalFilename || '',
        kind: track.kind || 'bundled-track',
        profileIndex: track.profileIndex
      }));
  }

  async function loadBundledTrackManifest() {
    state.tracks = sanitizeManifestTracks(DEFAULT_TRACKS);
    state.bundledCount = state.tracks.length;
    if (state.tracks.length) {
      await loadTrack(0, false);
    } else {
      state.index = -1;
      resetAudioSource();
      setTrackText(null);
      currentTime.textContent = '00:00';
      durationTime.textContent = '00:00';
      updateControls();
      updatePlayState();
      setStatus('Load a music file or add a track link to start playing.');
    }
    window.parent.postMessage({ channel: 'ourspace-record', kind: 'ready' }, '*');
  }

  // Receive the profile's saved music links without replacing its bundled records.
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.channel !== 'ourspace-record') return;
    const message = event.data;
    if (message.kind === 'sync') {
      const extra = Array.isArray(message.tracks) ? message.tracks : [];
      const clean = extra.filter(x => x && /^(https?:|blob:|data:audio\/)/i.test(x.src || ''))
        .map((x) => ({ id:'profile-' + x.sourceIndex, src:x.src, title:x.title || 'Untitled track',
          artist:x.artist || 'Unknown Artist', album:x.album || '', kind:'profile-link', profileIndex:x.sourceIndex }));
      const previous = state.index >= 0 ? state.tracks[state.index] : null;
      const localFiles = state.tracks.filter(x => x.kind === 'local-file');
      state.tracks = sanitizeManifestTracks(DEFAULT_TRACKS).concat(sanitizeManifestTracks(clean),localFiles);
      state.bundledCount = DEFAULT_TRACKS.length;
      const at = previous ? state.tracks.findIndex(x => x.id === previous.id && x.src === previous.src) : -1;
      if (at >= 0) {
        state.index = at;
        updateControls();
      } else if (state.tracks.length) {
        loadTrack(0, false);
      } else {
        state.index = -1;
        resetAudioSource();
        setTrackText(null);
        currentTime.textContent = '00:00';
        durationTime.textContent = '00:00';
        updateControls();
        updatePlayState();
        setStatus('Load a music file or add a track link to start playing.');
      }
    } else if (message.kind === 'select') {
      const i = Number(message.index);
      const trackIndex = state.tracks.findIndex(x => x.kind === 'profile-link' && x.profileIndex === i);
      if (trackIndex >= 0) loadTrack(trackIndex, Boolean(message.autoplay));
    } else if (message.kind === 'theme') {
      const root=document.documentElement, valid=x=>/^#[0-9a-f]{6}$/i.test(x||'');
      if(valid(message.cyan))root.style.setProperty('--storm-cyan',message.cyan);
      if(valid(message.orange))root.style.setProperty('--storm-orange',message.orange);
      const roles=message.roles||{};
      const materialMap={
        playerShellDark:'--wood-dark',playerShellMid:'--wood-mid',playerShellLight:'--wood-light',
        playerDeckLight:'--cream',playerDeckMid:'--cream-deep',playerDeckDeep:'--rp-deck-deep',
        playerScreen:'--screen',playerScreen2:'--screen-2',playerLightText:'--paper',
        playerMetalLight:'--gold-bright',playerMetalMid:'--gold',playerMetalDark:'--rp-metal-dark',
        playerOutline:'--rp-outline',playerHighlight:'--orange',playerSoftLine:'--rp-soft-line'
      };
      Object.entries(materialMap).forEach(([name,css])=>{if(valid(roles[name]))root.style.setProperty(css,roles[name])});
    }
  });

  function reportHeight() {
    const stage = document.querySelector('.widget-stage');
    if (!stage) return;
    const height = Math.ceil(stage.getBoundingClientRect().height) + 4;
    window.parent.postMessage({ channel: 'ourspace-record', kind: 'height', height }, '*');
  }
  if ('ResizeObserver' in window) new ResizeObserver(reportHeight).observe(document.querySelector('.widget-stage'));
  window.addEventListener('load', reportHeight);
  requestAnimationFrame(reportHeight);

  function installMediaSessionActions() {
    if (!('mediaSession' in navigator)) return;

    const actions = {
      play: () => playAudio(),
      pause: () => audio.pause(),
      previoustrack: () => changeTrack(-1),
      nexttrack: () => changeTrack(1),
      seekbackward: (details) => skipBy(-(details.seekOffset || 3)),
      seekforward: (details) => skipBy(details.seekOffset || 3),
      seekto: (details) => {
        if (!Number.isFinite(audio.duration)) return;
        audio.currentTime = Math.min(audio.duration, Math.max(0, details.seekTime || 0));
      }
    };

    for (const [action, handler] of Object.entries(actions)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (_) {
        // Some browsers expose Media Session without every action.
      }
    }
  }

  loadButton.addEventListener('click', () => picker.click());
  picker.addEventListener('change', () => addFiles(picker.files));
  playButton.addEventListener('click', togglePlay);
  rewindButton.addEventListener('click', () => skipBy(-3));
  forwardButton.addEventListener('click', () => skipBy(3));
  previousButton.addEventListener('click', () => changeTrack(-1));
  nextButton.addEventListener('click', () => changeTrack(1));
  waveformSeek.addEventListener('pointerdown', seekFromPointer);

  audio.addEventListener('play', () => {
    updatePlayState();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    setStatus(`Playing ${state.tracks[state.index]?.title || 'audio'}.`);
  });

  audio.addEventListener('pause', () => {
    updatePlayState();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    if (!audio.ended) setStatus('Paused.');
  });

  audio.addEventListener('ended', () => {
    updatePlayState();
    if (state.tracks.length > 1) loadTrack(state.index + 1, true);
    else {
      audio.currentTime = 0;
      setStatus('Track ended.');
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    durationTime.textContent = formatTime(audio.duration);
    currentTime.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('durationchange', () => {
    durationTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    currentTime.textContent = formatTime(audio.currentTime);
    if ('mediaSession' in navigator && Number.isFinite(audio.duration) && audio.duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: Math.min(audio.duration, Math.max(0, audio.currentTime))
        });
      } catch (_) {
        // Position state is optional and browser support varies.
      }
    }
  });

  audio.addEventListener('error', () => {
    const code = audio.error?.code || 0;
    const track = state.tracks[state.index];
    setStatus(`Could not play ${track?.title || 'this track'} (media error ${code}). If opened from inside a ZIP, extract the folder first.`);
    console.warn('HTMLMediaElement error:', { code, track, src: audio.currentSrc || audio.src });
    updatePlayState();
  });

  player.addEventListener('dragenter', (event) => {
    event.preventDefault();
    player.classList.add('drop-ready');
  });

  player.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    player.classList.add('drop-ready');
  });

  player.addEventListener('dragleave', (event) => {
    if (!player.contains(event.relatedTarget)) player.classList.remove('drop-ready');
  });

  player.addEventListener('drop', (event) => {
    event.preventDefault();
    player.classList.remove('drop-ready');
    addFiles(event.dataTransfer?.files);
  });

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (event.code === 'Space' && state.index >= 0) {
      event.preventDefault();
      togglePlay();
      return;
    }

    if (event.code === 'ArrowLeft' && state.index >= 0) {
      event.preventDefault();
      skipBy(-3);
      return;
    }

    if (event.code === 'ArrowRight' && state.index >= 0) {
      event.preventDefault();
      skipBy(3);
    }
  });

  window.addEventListener('beforeunload', () => {
    revokeCurrentUrl();
    engine.destroy();
  });

  updateControls();
  updatePlayState();
  installMediaSessionActions();
  loadBundledTrackManifest();
})();

