export type StoredCourse = {
  code: string
  title: string
  instructor: string
  color: 'blue' | 'purple' | 'green'
}

export type StoredFile = {
  id: string
  name: string
  type: string
  lastModified: number
  size: number
  courseCode: string
  uploadedAt: number
  blob: Blob
}

const databaseName = 'memex-workspace'
const databaseVersion = 1
let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('This browser does not support local file storage.'))
  }

  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, databaseVersion)

      request.addEventListener('upgradeneeded', () => {
        const database = request.result
        if (!database.objectStoreNames.contains('courses')) {
          database.createObjectStore('courses', { keyPath: 'code' })
        }
        if (!database.objectStoreNames.contains('files')) {
          database.createObjectStore('files', { keyPath: 'id' })
        }
      })

      request.addEventListener('success', () => resolve(request.result))
      request.addEventListener('error', () => reject(request.error ?? new Error('Could not open local storage.')))
      request.addEventListener('blocked', () => reject(new Error('Local storage is blocked by another open Memex tab.')))
    }).catch((error: unknown) => {
      databasePromise = undefined
      throw error
    })
  }

  return databasePromise
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve(), { once: true })
    transaction.addEventListener('abort', () => reject(transaction.error ?? new Error('Local storage transaction was aborted.')), { once: true })
    transaction.addEventListener('error', () => reject(transaction.error ?? new Error('Local storage transaction failed.')), { once: true })
  })
}

export async function loadWorkspace() {
  const database = await openDatabase()
  const transaction = database.transaction(['courses', 'files'], 'readonly')
  const completed = transactionComplete(transaction)
  const coursesRequest = transaction.objectStore('courses').getAll() as IDBRequest<StoredCourse[]>
  const filesRequest = transaction.objectStore('files').getAll() as IDBRequest<StoredFile[]>
  const [results] = await Promise.all([
    Promise.all([
      new Promise<StoredCourse[]>((resolve, reject) => {
        coursesRequest.addEventListener('success', () => resolve(coursesRequest.result), { once: true })
        coursesRequest.addEventListener('error', () => reject(coursesRequest.error), { once: true })
      }),
      new Promise<StoredFile[]>((resolve, reject) => {
        filesRequest.addEventListener('success', () => resolve(filesRequest.result), { once: true })
        filesRequest.addEventListener('error', () => reject(filesRequest.error), { once: true })
      }),
    ]),
    completed,
  ])
  const [courses, files] = results
  return { courses, files }
}

export async function saveCourse(course: StoredCourse) {
  const database = await openDatabase()
  const transaction = database.transaction('courses', 'readwrite')
  const completed = transactionComplete(transaction)
  transaction.objectStore('courses').put(course)
  await completed
}

export async function saveFiles(files: StoredFile[]) {
  const database = await openDatabase()
  const transaction = database.transaction('files', 'readwrite')
  const completed = transactionComplete(transaction)
  const store = transaction.objectStore('files')
  files.forEach((file) => store.put(file))
  await completed
}

export async function deleteFile(id: string) {
  const database = await openDatabase()
  const transaction = database.transaction('files', 'readwrite')
  const completed = transactionComplete(transaction)
  transaction.objectStore('files').delete(id)
  await completed
}

export async function deleteCourseAndUnassignFiles(code: string) {
  const database = await openDatabase()
  const transaction = database.transaction(['courses', 'files'], 'readwrite')
  const completed = transactionComplete(transaction)
  const courses = transaction.objectStore('courses')
  const files = transaction.objectStore('files')
  const request = files.getAll() as IDBRequest<StoredFile[]>

  request.addEventListener('success', () => {
    courses.delete(code)
    request.result.forEach((file) => {
      if (file.courseCode === code) files.put({ ...file, courseCode: '' })
    })
  }, { once: true })

  await completed
}
