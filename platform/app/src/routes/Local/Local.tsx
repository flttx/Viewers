import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { DicomMetadataStore, MODULE_TYPES } from '@ohif/core';
import { useTranslation } from 'react-i18next';

import Dropzone from 'react-dropzone';
import filesToStudies from './filesToStudies';

import { extensionManager } from '../../App.tsx';

import { Icon, Button, LoadingIndicatorProgress, Tooltip } from '@ohif/ui';
import { Icons } from '@ohif/ui-next';

const getLoadButton = (onDrop, text, isDir) => {
  return (
    <Dropzone
      onDrop={onDrop}
      noDrag
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <Button
            rounded="full"
            variant="contained" // outlined
            disabled={false}
            endIcon={<Icons.LaunchArrow />}
            className={classnames(
              'font-medium',
              'ml-2',
              'bg-primary',
              'hover:bg-primary-foreground'
            )}
            onClick={() => {}}
          >
            {text}
            {isDir ? (
              <input
                {...getInputProps()}
                webkitdirectory="true"
                mozdirectory="true"
              />
            ) : (
              <input {...getInputProps()} />
            )}
          </Button>
        </div>
      )}
    </Dropzone>
  );
};

type LocalProps = {
  modePath: string;
};

function Local({ modePath }: LocalProps) {
  const navigate = useNavigate();
  const dropzoneRef = useRef();
  const [dropInitiated, setDropInitiated] = React.useState(false);
  const { t } = useTranslation('Local');

  // Initializing the dicom local dataSource
  // const dataSourceModules = extensionManager.modules[MODULE_TYPES.DATA_SOURCE];
  // const localDataSources = dataSourceModules.reduce((acc, curr) => {
  //   const mods = [];
  //   curr.module.forEach(mod => {
  //     if (mod.type === 'localApi') {
  //       mods.push(mod);
  //     }
  //   });
  //   return acc.concat(mods);
  // }, []);

  // const firstLocalDataSource = localDataSources[0];
  // const dataSource = firstLocalDataSource.createDataSource({});

  const microscopyExtensionLoaded = extensionManager.registeredExtensionIds.includes(
    '@ohif/extension-dicom-microscopy'
  );

  const onDrop = async acceptedFiles => {
    const studies = await filesToStudies(acceptedFiles);
    setDropInitiated(false);
    console.log('studies:', studies);
    if (!studies || studies.length === 0) {
      return;
    }

    const query = new URLSearchParams();

    if (microscopyExtensionLoaded) {
      // TODO: for microscopy, we are forcing microscopy mode, which is not ideal.
      //     we should make the local drag and drop navigate to the worklist and
      //     there user can select microscopy mode
      const smStudies = studies.filter(id => {
        const study = DicomMetadataStore.getStudy(id);
        return (
          study.series.findIndex(s => s.Modality === 'SM' || s.instances[0].Modality === 'SM') >= 0
        );
      });

      if (smStudies.length > 0) {
        smStudies.forEach(id => query.append('StudyInstanceUIDs', id));

        modePath = 'microscopy';
      }
    }
    // Todo: navigate to work list and let user select a mode
    // studies.forEach(id => query.append('StudyInstanceUIDs', id));
    // query.append('datasources', 'dicomlocal');
    // navigate(`/${modePath}?${decodeURIComponent(query.toString())}`);
    // console.log('url:', `/viewer?${query.toString()}`);

    query.append('StudyInstanceUIDs', studies[studies.length - 1]);
    navigate(`/viewer/dicomlocal?${query.toString()}`);
  };

  const onClickReturn = () => {
    // 通知父窗口返回到工作列表
    window.parent.postMessage(
      {
        type: 'back-to-case',
      },
      '*'
    );
  };

  // Set body style
  useEffect(() => {
    document.body.classList.add('bg-background');

    // 通知父窗口页面渲染完成
    window.parent.postMessage(
      {
        type: 'ct-viewer-loaded',
      },
      '*'
    );

    return () => {
      document.body.classList.remove('bg-background');
    };
  }, []);

  return (
    <Dropzone
      ref={dropzoneRef}
      onDrop={acceptedFiles => {
        setDropInitiated(true);
        onDrop(acceptedFiles);
      }}
      noClick
    >
      {({ getRootProps }) => (
        <div
          {...getRootProps()}
          style={{ width: '100%', height: '100%' }}
        >
          <div className="flex h-screen w-screen items-center justify-center">
            <div className="absolute left-0 top-[10px] flex items-center">
              <div
                className={classnames('mr-3 inline-flex cursor-pointer items-center')}
                onClick={onClickReturn}
                data-cy="return-to-work-list"
              >
                <Icons.Back />
                <span className="ml-[10px] mr-1 text-[17px]">{t('Header:CT Viewer')}</span>
                <Icons.CareRight />
              </div>
            </div>
            <div className="bg-secondary mx-auto space-y-2 rounded-lg py-8 px-8 drop-shadow-md">
              <div className="flex items-center justify-center">
                <Icons.Logo className="w-50 h-16" />
              </div>
              <div className="space-y-2 pt-4 text-center">
                {dropInitiated ? (
                  <div className="flex flex-col items-center justify-center pt-48">
                    <LoadingIndicatorProgress className={'bg-background h-full w-full'} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex text-base text-gray-500">
                      {t('Note')}：{' '}
                      <ul>
                        <li className="text-left">
                          1.{t('Only support standard DICOM files')}，
                          <Tooltip
                            content={
                              <div className="flex flex-col">
                                <span className="font-bold">{t('Verification method')}：</span>
                                <div className="flex list-disc flex-col pl-4">
                                  <span>1. {t('View with MicroDicom Viewer')}</span>
                                  <span>2. {t('Check DICOM Tags')}</span>
                                  <span>3. {t('Check if there are key fields')}</span>
                                </div>
                              </div>
                            }
                            position="right"
                            className="inline-flex"
                          >
                            <span className="text-primary cursor-pointer">
                              {t('View verification method')}
                            </span>
                          </Tooltip>
                        </li>
                        <li className="text-left">
                          2.{t('You data is not uploaded to any server')}
                        </li>
                      </ul>
                    </div>

                    <p className="text-xg pt-6 font-semibold text-gray-700">
                      {t('Drag and Drop DICOM files here to load them in the Viewer')}
                    </p>
                    <p className="text-lg text-gray-500">{t('Or click to')}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-around pt-4">
                {getLoadButton(
                  acceptedFiles => {
                    setDropInitiated(true);
                    onDrop(acceptedFiles);
                  },
                  t('Load files'),
                  false
                )}
                {getLoadButton(
                  acceptedFiles => {
                    setDropInitiated(true);
                    onDrop(acceptedFiles);
                  },
                  t('Load folders'),
                  true
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
}

export default Local;
