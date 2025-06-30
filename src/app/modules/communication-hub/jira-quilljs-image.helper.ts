/* eslint-disable @typescript-eslint/no-use-before-define */
import Quill from 'quill'

abstract class QuillImageData {
  public dataUrl: string | ArrayBuffer
  public type: string
  public name: string
  public constructor(
    dataUrl: string | ArrayBuffer,
    type: string,
    name?: string
  ) {
    this.dataUrl = dataUrl
    this.type = type
    this.name = name || ''
  }
  public abstract minify(option: IImageDataMinifyOption)
  public abstract toFile(filename?: string)
  public abstract toBlob()
}

class ImageData extends QuillImageData {
  dataUrl: string | ArrayBuffer
  type: string
  name: string

  constructor(dataUrl: string | ArrayBuffer, type: string, name?: string) {
    super(dataUrl, type, name)
    this.dataUrl = dataUrl
    this.type = type
    this.name = name || `${generateFilename()}.${this.getSuffix()}`
  }

  /* minify the image
   */
  public minify(
    option: IImageDataMinifyOption
  ): Promise<ImageData | { message: string }> {
    return new Promise((resolve, reject) => {
      const maxWidth = option.maxWidth || 800
      const maxHeight = option.maxHeight || 800
      const quality = option.quality || 0.8
      if (!this.dataUrl) {
        return reject({
          message:
            '[error] QuillImageDropAndPaste: Fail to minify the image, dataUrl should not be empty.',
        })
      }
      const image = new Image()
      image.onload = () => {
        const width = image.width
        const height = image.height
        if (width > height) {
          if (width > maxWidth) {
            image.height = (height * maxWidth) / width
            image.width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            image.width = (width * maxHeight) / height
            image.height = maxHeight
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(image, 0, 0, image.width, image.height)
          const canvasType = this.type || 'image/png'
          const canvasDataUrl = canvas.toDataURL(canvasType, quality)
          resolve(new ImageData(canvasDataUrl, canvasType, this.name))
        } else {
          reject({
            message:
              '[error] QuillImageDropAndPaste: Fail to minify the image, create canvas context failure.',
          })
        }
      }
      image.src = resolveDataUrl(this.dataUrl, this.type)
    })
  }

  /* convert blob to file
   */
  public toFile(filename?: string): File | null {
    filename = filename || this.name
    if (!window.File) {
      console.error(
        '[error] QuillImageDropAndPaste: Your browser didnot support File API.'
      )
      return null
    }
    return new File([this.toBlob()], filename, { type: this.type })
  }

  /* convert dataURL to blob
   */
  public toBlob(): Blob {
    const base64 = resolveDataUrl(this.dataUrl, this.type)
      .replace(/^[^,]+,/, '')
    const buff = binaryStringToArrayBuffer(atob(base64))
    return this.createBlob([buff], { type: this.type })
  }

  /* create blob
   */
  private createBlob(
    parts: ArrayBuffer[],
    properties: string | { type?: string } | undefined
  ): Blob {
    if (!properties) properties = {}
    if (typeof properties === 'string') properties = { type: properties }
    try {
      return new Blob(parts, properties)
    } catch (e: any) {
      if (e.name !== 'TypeError') throw e
      const Builder =
        'BlobBuilder' in window
          ? (window as any).BlobBuilder
          : 'MSBlobBuilder' in window
            ? (window as any).MSBlobBuilder
            : 'MozBlobBuilder' in window
              ? (window as any).MozBlobBuilder
              : (window as any).WebKitBlobBuilder
      const builder = new Builder()
      for (let i = 0; i < parts.length; i++) builder.append(parts[i])
      return builder.getBlob(properties.type) as Blob
    }
  }

  private getSuffix(): string {
    const matched = this.type.match(/^image\/(\w+)$/)
    const suffix = matched ? matched[1] : 'png'
    return suffix
  }
}

interface IImageDropAndPasteOption {
  autoConvert?: boolean
  enableNativeUploader?: boolean
  handler?: (
    dataUrl: string | ArrayBuffer,
    type?: string,
    imageData?: ImageData
  ) => void
}

export abstract class QuillImageDropAndPaste {
  static ImageData
  public quill
  public option: IImageDropAndPasteOption
  public constructor(quill: Quill, option: IImageDropAndPasteOption) {
    this.quill = quill
    this.option = option
  }
  protected abstract handleDrop(e: DragEvent)
  protected abstract handlePaste(e: ClipboardEvent)
  protected abstract readFiles(
    files: DataTransferItemList | FileList,
    callback: (dataUrl: string | ArrayBuffer, type?: string) => void,
    e: ClipboardEvent | DragEvent
  )
  protected abstract handleDataTransfer(
    file: DataTransferItem,
    callback: (dataUrl: string | ArrayBuffer, type?: string) => void,
    e: ClipboardEvent | DragEvent
  )
  protected abstract handleDroppedFile(
    file: File,
    callback: (dataUrl: string | ArrayBuffer, type?: string) => void,
    e: ClipboardEvent | DragEvent
  )
  protected abstract insert(content: string, type: string)
  protected abstract getIndex()
}

class ImageDropAndPaste extends QuillImageDropAndPaste {
  static ImageData = ImageData
  quill: Quill
  option: IImageDropAndPasteOption

  constructor(quill: Quill, option: IImageDropAndPasteOption) {
    super(quill, option)
    if (typeof option.autoConvert !== 'boolean') option.autoConvert = true
    if (option.enableNativeUploader !== true) {
      // @ts-ignore
      utils.isObject(quill.uploader) &&
      // @ts-ignore
      utils.isObject(quill.uploader?.options) &&
      // @ts-ignore
      (quill.uploader.options.handler = () => {})
    }
    this.quill = quill
    this.option = option
    this.handleDrop = this.handleDrop.bind(this)
    this.handlePaste = this.handlePaste.bind(this)
    this.insert = this.insert.bind(this)
    this.quill.root.addEventListener('drop', this.handleDrop, false)
    this.quill.root.addEventListener('paste', this.handlePaste, false)
  }

  /* handle image drop event
   */
  handleDrop(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      e.preventDefault()
      if (document.caretRangeFromPoint) {
        const selection = document.getSelection()
        const range = document.caretRangeFromPoint(e.clientX, e.clientY)
        if (selection && range) {
          selection.setBaseAndExtent(
            range.startContainer,
            range.startOffset,
            range.startContainer,
            range.startOffset
          )
        }
      }
      this.readFiles(
        e.dataTransfer.files,
        (dataUrl: string | ArrayBuffer, type = 'image/png', name?: string) => {
          if (typeof this.option.handler === 'function') {
            this.option.handler.call(
              this,
              dataUrl,
              type,
              new ImageData(dataUrl, type, name)
            )
          } else {
            this.insert.call(this, resolveDataUrl(dataUrl, type), type)
          }
        },
        e
      )
    }
  }

  /* handle image paste event
   */
  handlePaste(e: ClipboardEvent): void {
    if (
      e.clipboardData &&
      e.clipboardData.items &&
      e.clipboardData.items.length
    ) {
      if (isRichText(e.clipboardData.items)) return
      this.readFiles(
        e.clipboardData.items,
        (dataUrl: string | ArrayBuffer, type = 'image/png') => {
          if (typeof this.option.handler === 'function') {
            this.option.handler.call(
              this,
              dataUrl,
              type,
              new ImageData(dataUrl, type)
            )
          } else {
            this.insert(resolveDataUrl(dataUrl, type), 'image')
          }
        },
        e
      )
    }
  }

  /* read the files
   */
  readFiles(
    files: DataTransferItemList | FileList,
    callback: (
      dataUrl: string | ArrayBuffer,
      type: string,
      name?: string
    ) => void,
    e: ClipboardEvent | DragEvent
  ): void {
    Array.prototype.forEach.call(files, (file: DataTransferItem | File) => {
      if (isType(file, 'DataTransferItem')) {
        this.handleDataTransfer(file as DataTransferItem, callback, e)
      } else if (file instanceof File) {
        this.handleDroppedFile(file, callback, e)
      }
    })
  }

  /* handle the pasted data
   */
  handleDataTransfer(
    file: DataTransferItem,
    callback: (
      dataUrl: string | ArrayBuffer,
      type: string,
      name?: string
    ) => void,
    e: ClipboardEvent | DragEvent
  ): void {
    const that = this
    const { type } = file
    if (type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i)) {
      e.preventDefault()
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          callback(e.target.result, type)
        }
      }
      const blob = file.getAsFile ? file.getAsFile() : file
      if (blob instanceof Blob) reader.readAsDataURL(blob)
    } else if (type.match(/^text\/plain$/i)) {
      file.getAsString(s => {
        // Don't preventDefault here, because there might be clipboard matchers need to be triggered
        // see https://github.com/chenjuneking/quill-image-drop-and-paste/issues/37
        if (urlIsImageDataUrl(s)) {
          // If the url is a dataUrl, just fire the callback
          const matched = s.match(/^data:(image\/\w+);base64,/)
          const t = matched ? matched[1] : 'image/png'
          const i = this.getIndex()
          callback(s, t)
          this.quill.deleteText(i, s.length, 'user')
          this.quill.setSelection(i as any)
        } else {
          if (this.option.autoConvert) {
            urlIsImage(s)
              .then(() => {
                // If the url isn't a dataUrl, delete the pasted text and insert the image
                setTimeout(() => {
                  const i = this.getIndex()
                  this.quill.deleteText(i - s.length, s.length, 'user')
                  that.insert(s, 'image', i - s.length)
                })
              })
              .catch(() => {
                // Otherwise, do nothing
              })
          }
        }
      })
    }
  }

  /* handle the dropped data
   */
  handleDroppedFile(
    file: File,
    callback: (
      dataUrl: string | ArrayBuffer,
      type: string,
      name?: string
    ) => void,
    e: ClipboardEvent | DragEvent
  ): void {
    const { type, name = '' } = file
    if (type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i)) {
      e.preventDefault()
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          callback(e.target.result, type, name)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  /* insert into the editor
   */
  insert(content: string, type: string, index?: number): void {
    index = index === undefined ? this.getIndex() : index
    let _index: any
    if (type.startsWith('image')) {
      _index = index + 1
      this.quill.insertEmbed(index, 'image', content, 'user')
    } else if (type.startsWith('text')) {
      _index = index + content.length
      this.quill.insertText(index, content, 'user')
    }
    setTimeout(() => {
      this.quill.setSelection(_index)
    })
  }

  getIndex(): number {
    let index: number | undefined = (this.quill.getSelection(true) || {}).index
    if (index === undefined || index < 0) index = this.quill.getLength()
    return index
  }
}

;(window as any).QuillImageDropAndPaste = ImageDropAndPaste
if ('Quill' in window) {
  ;(window as any).Quill.register(
    'modules/imageDropAndPaste',
    ImageDropAndPaste
  )
}


export interface IImageDataMinifyOption {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

function generateFilename(): string {
    return btoa(String(Math.random() * 1e6) + String(+new Date())).replace(
      '=',
      ''
    )
  }
  /* detect the giving url is a image
   */
function urlIsImage(url: string, abortTimeout = 3000): Promise<boolean> {
    if (!this.validURL(url)) {
      return Promise.reject(false)
    }
    if (/\.(jpeg|jpg|gif|png|webp|tiff|bmp)$/.test(url)) {
      return Promise.resolve(true)
    }
    return new Promise((resolve, reject) => {
      let timer: any = undefined
      const img = new Image()
      img.onerror = () => {
        clearTimeout(timer)
        reject(false)
      }
      img.onabort = () => {
        clearTimeout(timer)
        reject(false)
      }
      img.onload = () => {
        clearTimeout(timer)
        resolve(true)
      }
      timer = setTimeout(() => {
        img.src = '//!/an/invalid.jpg'
        reject(false)
      }, abortTimeout)
      img.src = url
    })
  }
function urlIsImageDataUrl(url: string): boolean {
    return /^data:image\/\w+;base64,/.test(url)
  }
  /* check string is a valid url
   */
function validURL(str: string): boolean {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    try {
      return Boolean(new URL(str))
    } catch (e) {
      return false
    }
  }
  /* check the giving string is a html text
   */
function isRichText(clipboardDataItems: DataTransferItemList): boolean {
    let hasHtml = false
    let hasImage = false
    Array.prototype.forEach.call(clipboardDataItems, item => {
      if (item.kind === 'string' && item.type.match(/^text\/html$/i)) {
        hasHtml = true
      }
      if (item.kind === 'file' && item.type.match(/^image\/\w+$/i)) {
        hasImage = true
      }
    })
    return hasHtml && !hasImage
  }
  /* resolve dataUrl to base64 string
   */
function resolveDataUrl(dataUrl: string | ArrayBuffer, type: string): string {
    let str = ''
    if (typeof dataUrl === 'string') {
      str = dataUrl
    } else if (dataUrl instanceof ArrayBuffer) {
      str = this.arrayBufferToBase64Url(dataUrl, type)
    }
    return str
  }
  /* generate array buffer from binary string
   */
function binaryStringToArrayBuffer(binary: string): ArrayBuffer {
    const len = binary.length
    const buffer = new ArrayBuffer(len)
    const arr = new Uint8Array(buffer)
    let i = -1
    while (++i < len) arr[i] = binary.charCodeAt(i)
    return buffer
  }
  /* generate base64 string from array buffer
   */
  function arrayBufferToBase64Url(arrayBuffer: ArrayBuffer, type: string): string {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    return (
      `data:${type};base64,` +
      btoa(
        new Uint8Array(arrayBuffer).reduce(
          (acc: string, byte: number) => acc + String.fromCharCode(byte),
          ''
        )
      )
    )
  }
  /* copy text - make text store in the clipboard
   */
  function copyText(content: string, target = document.body): boolean {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement
    element.value = content
    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS
    const selection = document.getSelection()
    let originalRange: boolean | Range = false
    if (selection && selection.rangeCount > 0) {
      originalRange = selection.getRangeAt(0)
    }
    target.append(element)
    element.select()
    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = content.length
    let isSuccess = false
    try {
      isSuccess = document.execCommand('copy')
      // eslint-disable-next-line no-empty
    } catch {}
    element.remove()
    if (selection && originalRange) {
      selection.removeAllRanges()
      selection.addRange(originalRange)
    }
    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
    return isSuccess
  }
  /* check the type of specify target
   */
  function isType(target: any, type: string): boolean {
    return Object.prototype.toString.call(target) === `[object ${type}]`
  }
  /** check the target whether is object
   */
  function isObject(target: any): boolean {/* eslint-disable-line @typescript-eslint/no-unused-vars */
    return this.isType(target, 'Object')
  }
