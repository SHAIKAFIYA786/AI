import { WebContainer } from '@webcontainer/api';

let webContainerInstancePromise = null;

export const getWebContainer = () => {
  if (!webContainerInstancePromise) {
    webContainerInstancePromise = WebContainer.boot();
  }
  return webContainerInstancePromise;
}
