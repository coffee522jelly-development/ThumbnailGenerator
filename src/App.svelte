<script lang="ts">
  import { onMount } from 'svelte';
  import { save } from '@tauri-apps/plugin-dialog';
  import { writeFile } from '@tauri-apps/plugin-fs';

  // Constants
  const STORAGE_KEY = 'thumbnail-generator-settings';
  const fonts = [
    'Roboto', 'Montserrat', 'Oswald', 'Playfair Display', 'Noto Sans JP',
    'Bungee', 'Potta One', 'Dela Gothic One', 'RocknRoll One', 'DotGothic16',
    'Hachi Maru Pop', 'Kaisei Tokumin', 'Kiwi Maru', 'Reggae One', 'Stick', 'Train One'
  ];

  // State
  let canvas: HTMLCanvasElement;
  let text = 'Thumbnail Generator';
  let width = 1200;
  let height = 630;
  let bgColor = '#ffffff';
  let textColor = '#000000';
  let fontSize = 100;
  let fontFamily = 'Roboto';
  let imageSrc: string | null = null;
  let bgImage: HTMLImageElement | null = null;
  let isLoaded = false;

  function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        text = settings.text ?? text;
        width = settings.width ?? width;
        height = settings.height ?? height;
        bgColor = settings.bgColor ?? bgColor;
        textColor = settings.textColor ?? textColor;
        fontSize = settings.fontSize ?? fontSize;
        fontFamily = settings.fontFamily ?? fontFamily;
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }

  function saveSettings() {
    if (!isLoaded) return;
    const settings = {
      text, width, height, bgColor, textColor, fontSize, fontFamily
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageSrc = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          bgImage = img;
          width = img.width;
          height = img.height;
          draw();
        };
        img.src = imageSrc;
      };
      reader.readAsDataURL(file);
    }
  }

  function draw() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Draw Background
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw Text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px "${fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }

  async function saveImage() {
    try {
      const path = await save({
        filters: [
          { name: 'PNG Image', extensions: ['png'] },
          { name: 'WebP Image', extensions: ['webp'] }
        ]
      });

      if (path) {
        const format = path.endsWith('.webp') ? 'image/webp' : 'image/png';
        const dataUrl = canvas.toDataURL(format);
        const base64Data = dataUrl.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        await writeFile(path, binaryData);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  }

  // Reactive redraw and save
  $: if (canvas && (text || width || height || bgColor || textColor || fontSize || fontFamily || bgImage)) {
    draw();
    saveSettings();
  }

  onMount(() => {
    loadSettings();
    isLoaded = true;
    draw();
  });
</script>

<main class="h-screen flex flex-col bg-base-200 text-base-content overflow-hidden">
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar Controls -->
    <aside class="w-64 bg-base-100 border-r border-base-300 flex flex-col shadow-lg z-10 overflow-y-auto">
      <div class="p-3 space-y-3">
        <div class="form-control">
          <label class="label py-1" for="text-input"><span class="label-text text-xs font-bold">Text</span></label>
          <input id="text-input" type="text" bind:value={text} class="input input-bordered input-sm w-full" placeholder="Text..." />
        </div>

        <div class="form-control">
          <label class="label py-1" for="file-input"><span class="label-text text-xs font-bold">BG Image</span></label>
          <input id="file-input" type="file" accept="image/*" on:change={handleImageUpload} class="file-input file-input-bordered file-input-xs w-full" />
          {#if bgImage}
            <button class="btn btn-ghost btn-xs text-error mt-1 h-auto min-h-0 py-0.5" on:click={() => { bgImage = null; imageSrc = null; draw(); }}>Remove Image</button>
          {/if}
        </div>

        {#if !bgImage}
          <div class="grid grid-cols-2 gap-2">
            <div class="form-control">
              <label class="label py-1" for="width-input"><span class="label-text text-xs font-bold">W</span></label>
              <input id="width-input" type="number" bind:value={width} class="input input-bordered input-sm w-full" />
            </div>
            <div class="form-control">
              <label class="label py-1" for="height-input"><span class="label-text text-xs font-bold">H</span></label>
              <input id="height-input" type="number" bind:value={height} class="input input-bordered input-sm w-full" />
            </div>
          </div>

          <div class="form-control">
            <label class="label py-1" for="bg-color-input"><span class="label-text text-xs font-bold">BG Color</span></label>
            <input id="bg-color-input" type="color" bind:value={bgColor} class="w-full h-8 cursor-pointer rounded border border-base-300" />
          </div>
        {/if}

        <div class="form-control">
          <label class="label py-1" for="text-color-input"><span class="label-text text-xs font-bold">Text Color</span></label>
          <input id="text-color-input" type="color" bind:value={textColor} class="w-full h-8 cursor-pointer rounded border border-base-300" />
        </div>

        <div class="form-control">
          <label class="label py-1" for="font-size-input"><span class="label-text text-xs font-bold">Size: {fontSize}px</span></label>
          <input id="font-size-input" type="range" min="10" max="300" bind:value={fontSize} class="range range-primary range-xs" />
        </div>

        <div class="form-control">
          <label class="label py-1" for="font-family-select"><span class="label-text text-xs font-bold">Font</span></label>
          <select id="font-family-select" bind:value={fontFamily} class="select select-bordered select-sm w-full">
            {#each fonts as font}
              <option value={font} style="font-family: '{font}'">{font}</option>
            {/each}
          </select>
        </div>

        <button class="btn btn-primary btn-sm w-full mt-4 shadow" on:click={saveImage}>
          Save (PNG/WebP)
        </button>
      </div>
    </aside>

    <!-- Main Preview Area -->
    <section class="flex-1 p-4 flex flex-col items-center justify-center overflow-auto relative">
      <div class="canvas-container shadow-2xl rounded-sm bg-white overflow-hidden">
        <canvas bind:this={canvas} class="max-w-full max-h-full block"></canvas>
      </div>
    </section>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .canvas-container {
    max-width: 95%;
    max-height: 95%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
