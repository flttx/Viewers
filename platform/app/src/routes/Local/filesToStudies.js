import FileLoaderService from './fileLoaderService';
import { DicomMetadataStore, UINotificationService } from '@ohif/core';

const processFile = async file => {
  try {
    const fileLoaderService = new FileLoaderService(file);
    const imageId = fileLoaderService.addFile(file);
    const image = await fileLoaderService.loadFile(file, imageId);
    const dicomJSONDataset = await fileLoaderService.getDataset(image, imageId);

    DicomMetadataStore.addInstance(dicomJSONDataset);
  } catch (error) {
    console.log(error.name, ':Error when trying to load and process local files:', error.message);
    return { error: true, fileName: file.name };
  }
};

export default async function filesToStudies(files) {
  const uiNotificationService = new UINotificationService();
  const results = await Promise.all(files.map(processFile));

  const isError = results.some(result => result?.error);

  // 如果有错误文件
  if (isError) {
    uiNotificationService.show({
      title: '文件处理错误',
      message: `您上传的不是标准DICOM文件`,
      type: 'error',
      duration: 7000,
    });
    return false;
  }

  return DicomMetadataStore.getStudyInstanceUIDs();
}
