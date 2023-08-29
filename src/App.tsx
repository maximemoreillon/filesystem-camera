import type { Component } from "solid-js"
import { createSignal, Show } from "solid-js"

const App: Component = () => {
  let video: undefined | HTMLVideoElement
  let canvas: undefined | HTMLCanvasElement

  const [getFolderHandle, setFolderHandle] =
    createSignal<FileSystemDirectoryHandle>()

  async function initCamera() {
    if (!video) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })

      video.setAttribute("playsinline", "true")
      video.srcObject = stream
      video.play()
    } catch (error) {
      console.error(`An error occurred: ${error}`)
    }
  }

  async function takePicture() {
    const folderHandle = getFolderHandle()
    const context = canvas?.getContext("2d")

    if (!folderHandle || !canvas || !video || !context) return

    canvas.height = video.videoHeight
    canvas.width = video.videoWidth

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      const filename = `${Date.now()}.png`

      //@ts-ignore
      const newHandle = await folderHandle.getFileHandle(filename, {
        create: true,
      })

      //@ts-ignore
      const writableStream = await newHandle.createWritable()
      await writableStream.write(blob)
      await writableStream.close()

      alert("Picture taken")
    })
  }

  async function selectDirectory() {
    const pickerOptions = {}

    // @ts-ignore
    const handle = await window.showDirectoryPicker(pickerOptions)
    if (!handle) return
    setFolderHandle(handle)

    await initCamera()
  }

  return (
    <div class="flex flex-col items-center gap-5">
      <div class="flex gap-2 items-center">
        <span>Directory:</span>
        <span>
          {getFolderHandle() ? getFolderHandle()?.name : "Not selected"}
        </span>
        <button class="border px-2 py-1" onclick={() => selectDirectory()}>
          Select
        </button>
      </div>

      <Show when={getFolderHandle()}>
        <div>
          <video v-show="!value" ref={video}>
            Video stream not available.
          </video>
        </div>

        <div>
          <canvas style="display: none;" ref={canvas} />
        </div>

        <div>
          <button class="border px-2 py-1" onClick={() => takePicture()}>
            Take picture
          </button>
        </div>
      </Show>
    </div>
  )
}

export default App
