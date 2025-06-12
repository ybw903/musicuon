export const isWebview = () => '__TAURI_INTERNALS__' in window

export const resolveEnv = () => {
  if (!isWebview()) {
    return 'web'
  }
  return 'webview'
}
