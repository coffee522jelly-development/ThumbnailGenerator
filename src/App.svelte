<script lang="ts">
  import { onMount } from 'svelte';
  import { save } from '@tauri-apps/plugin-dialog';
  import { writeFile } from '@tauri-apps/plugin-fs';

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

  const fonts = [
    'Roboto', 'Montserrat', 'Oswald', 'Playfair Display', 'Noto Sans JP',
    'Bungee', 'Potta One', 'Dela Gothic One', 'RocknRoll One', 'DotGothic16',
    'Hachi Maru Pop', 'Kaisei Tokumin', 'Kiwi Maru', 'Reggae One', 'Stick', 'Train One'
  ];

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

    // Handle multi-line text if needed, but for now simple center
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
        alert('Image saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save image.');
    }
  }

  // Redraw when state changes
  $: if (canvas && (text || width || height || bgColor || textColor || fontSize || fontFamily || bgImage)) {
    draw();
  }

  onMount(() => {
    draw();
  });
</script>

<main class="container mx-auto p-4 max-w-5xl">
  <h1 class="text-4xl font-bold text-center mb-8 text-primary">Thumbnail Generator</h1>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Controls -->
    <div class="lg:col-span-1 space-y-6 bg-base-100 p-6 rounded-2xl shadow-xl">
      <div class="form-control">
        <label class="label" for="text-input"><span class="label-text font-semibold">Text</span></label>
        <input id="text-input" type="text" bind:value={text} class="input input-bordered w-full" placeholder="Enter text..." />
      </div>

      <div class="form-control">
        <label class="label" for="file-input"><span class="label-text font-semibold">Background Image</span></label>
        <input id="file-input" type="file" accept="image/*" on:change={handleImageUpload} class="file-input file-input-bordered w-full" />
        {#if bgImage}
          <button class="btn btn-xs btn-error mt-2" on:click={() => { bgImage = null; imageSrc = null; draw(); }}>Remove Image</button>
        {/if}
      </div>

      {#if !bgImage}
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label" for="width-input"><span class="label-text font-semibold">Width</span></label>
            <input id="width-input" type="number" bind:value={width} class="input input-bordered w-full" />
          </div>
          <div class="form-control">
            <label class="label" for="height-input"><span class="label-text font-semibold">Height</span></label>
            <input id="height-input" type="number" bind:value={height} class="input input-bordered w-full" />
          </div>
        </div>

        <div class="form-control">
          <label class="label" for="bg-color-input"><span class="label-text font-semibold">Background Color</span></label>
          <input id="bg-color-input" type="color" bind:value={bgColor} class="input input-bordered w-full h-12 p-1" />
        </div>
      {/if}

      <div class="form-control">
        <label class="label" for="text-color-input"><span class="label-text font-semibold">Font Color</span></label>
        <input id="text-color-input" type="color" bind:value={textColor} class="input input-bordered w-full h-12 p-1" />
      </div>

      <div class="form-control">
        <label class="label" for="font-size-input"><span class="label-text font-semibold">Font Size</span></label>
        <input id="font-size-input" type="range" min="10" max="300" bind:value={fontSize} class="range range-primary" />
        <span class="text-xs text-center mt-1">{fontSize}px</span>
      </div>

      <div class="form-control">
        <label class="label" for="font-family-select"><span class="label-text font-semibold">Font Family</span></label>
        <select id="font-family-select" bind:value={fontFamily} class="select select-bordered w-full">
          {#each fonts as font}
            <option value={font} style="font-family: '{font}'">{font}</option>
          {/each}
        </select>
      </div>

      <button class="btn btn-primary w-full shadow-lg" on:click={saveImage}>
        Save as PNG/WebP
      </button>
    </div>

    <!-- Preview -->
    <div class="lg:col-span-2 flex flex-col items-center space-y-4">
      <div class="w-full bg-base-200 p-4 rounded-2xl shadow-inner flex justify-center items-center overflow-auto min-h-[400px]">
        <canvas bind:this={canvas} class="max-w-full h-auto shadow-2xl rounded-lg"></canvas>
      </div>
      <p class="text-sm text-base-content/60">Preview of your generated thumbnail</p>
    </div>
  </div>
</main>

<style>
  :global(body) {
    background-color: #f3f4f6;
  }
</style>
